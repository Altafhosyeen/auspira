/**
 * Zero-dependency `.xlsx` export.
 *
 * A real Office Open XML workbook rather than a CSV rename, so Excel opens it without the
 * "the file format doesn't match the extension" warning and dates stay sortable. The package is a
 * plain ZIP of five XML parts, all written by hand here — SheetJS is not a dependency of this app
 * and pulling it in for a single register export is not worth the ~400 kB.
 *
 * Strings are written as inline strings (`t="inlineStr"`) so there is no shared-string table to
 * maintain, and entries are STORED (uncompressed) so no deflate implementation is needed. Register
 * exports are a few hundred rows, so the size cost is irrelevant.
 */

const XLSX_MIME = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

/** Style indexes into `cellXfs` in `STYLES_XML` below. */
const STYLE_DEFAULT = 0;
const STYLE_HEADER = 1;
const STYLE_DATE = 2;

/** Excel's day-zero. Serial 1 is 1 Jan 1900, and 1900 is wrongly treated as a leap year. */
const EXCEL_EPOCH_MS = Date.UTC(1899, 11, 30);

const MS_PER_DAY = 86_400_000;

export type XlsxCellValue = string | number | boolean | Date | null | undefined;

export interface XlsxColumn<TRow> {
  header: string;
  /** Column width in characters — roughly the number of "0" glyphs that fit. */
  width?: number;
  value: (row: TRow) => XlsxCellValue;
}

export interface XlsxExportOptions<TRow> {
  /** File name without the `.xlsx` extension; illegal path characters are stripped. */
  fileName: string;
  /** Worksheet tab name. Excel caps this at 31 characters and rejects `[]:*?/\`. */
  sheetName?: string;
  columns: XlsxColumn<TRow>[];
  rows: TRow[];
}

// ─── XML ─────────────────────────────────────────────────────────────────────

const XML_ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&apos;',
};

/**
 * Escapes markup and drops the control characters XML 1.0 forbids outright — pasted email content
 * routinely carries stray NUL/backspace bytes, and a single one makes Excel reject the whole file.
 */
const escapeXml = (value: string) =>
  value
    // eslint-disable-next-line no-control-regex
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '')
    .replace(/[&<>"']/g, (char) => XML_ESCAPES[char]);

/** 0 → "A", 25 → "Z", 26 → "AA". */
const columnLetter = (index: number) => {
  let letter = '';
  for (let n = index; n >= 0; n = Math.floor(n / 26) - 1) {
    letter = String.fromCharCode(65 + (n % 26)) + letter;
  }
  return letter;
};

/**
 * Date → Excel serial number, using the date's local wall-clock reading so a `2026-06-27` cell
 * does not slip to the 26th for viewers west of UTC.
 */
const toExcelSerial = (date: Date) =>
  (date.getTime() - date.getTimezoneOffset() * 60_000 - EXCEL_EPOCH_MS) / MS_PER_DAY;

const cellXml = (ref: string, value: XlsxCellValue, style: number) => {
  const styleAttr = style === STYLE_DEFAULT ? '' : ` s="${style}"`;

  if (value === null || value === undefined || value === '') {
    return `<c r="${ref}"${styleAttr}/>`;
  }
  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) return `<c r="${ref}"${styleAttr}/>`;
    return `<c r="${ref}" s="${STYLE_DATE}"><v>${toExcelSerial(value)}</v></c>`;
  }
  if (typeof value === 'number') {
    // Infinity/NaN have no numeric cell representation — fall through to text.
    if (Number.isFinite(value)) return `<c r="${ref}"${styleAttr}><v>${value}</v></c>`;
  }
  if (typeof value === 'boolean') {
    return `<c r="${ref}"${styleAttr} t="b"><v>${value ? 1 : 0}</v></c>`;
  }

  const text = escapeXml(String(value));
  return `<c r="${ref}"${styleAttr} t="inlineStr"><is><t xml:space="preserve">${text}</t></is></c>`;
};

const XML_DECLARATION = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>';

const CONTENT_TYPES_XML = `${XML_DECLARATION}
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/></Types>`;

const ROOT_RELS_XML = `${XML_DECLARATION}
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>`;

const WORKBOOK_RELS_XML = `${XML_DECLARATION}
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>`;

/**
 * Minimal style table. Excel requires the first fill to be `none` and the second `gray125`, and
 * requires at least one font, border and cellStyleXf even when unused — omitting any of them
 * makes it report the workbook as corrupt.
 */
const STYLES_XML = `${XML_DECLARATION}
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><numFmts count="1"><numFmt numFmtId="164" formatCode="dd mmm yyyy"/></numFmts><fonts count="2"><font><sz val="11"/><name val="Calibri"/></font><font><b/><sz val="11"/><name val="Calibri"/></font></fonts><fills count="2"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill></fills><borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="3"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/><xf numFmtId="0" fontId="1" fillId="0" borderId="0" xfId="0" applyFont="1"/><xf numFmtId="164" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1"/></cellXfs></styleSheet>`;

const workbookXml = (sheetName: string) => `${XML_DECLARATION}
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="${escapeXml(sheetName)}" sheetId="1" r:id="rId1"/></sheets></workbook>`;

const worksheetXml = <TRow>(columns: XlsxColumn<TRow>[], rows: TRow[]) => {
  const lastColumn = columnLetter(columns.length - 1);
  const lastRow = rows.length + 1;

  const cols = columns
    .map((column, index) => {
      const width = column.width ?? 20;
      return `<col min="${index + 1}" max="${index + 1}" width="${width}" customWidth="1"/>`;
    })
    .join('');

  const headerRow = `<row r="1">${columns
    .map((column, index) => cellXml(`${columnLetter(index)}1`, column.header, STYLE_HEADER))
    .join('')}</row>`;

  const bodyRows = rows
    .map((row, rowIndex) => {
      const reference = rowIndex + 2; // row 1 is the header
      const cells = columns
        .map((column, index) =>
          cellXml(`${columnLetter(index)}${reference}`, column.value(row), STYLE_DEFAULT)
        )
        .join('');
      return `<row r="${reference}">${cells}</row>`;
    })
    .join('');

  return `${XML_DECLARATION}
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews><cols>${cols}</cols><sheetData>${headerRow}${bodyRows}</sheetData><autoFilter ref="A1:${lastColumn}${lastRow}"/></worksheet>`;
};

// ─── ZIP ─────────────────────────────────────────────────────────────────────

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i += 1) {
    let value = i;
    for (let bit = 0; bit < 8; bit += 1) {
      value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
    }
    table[i] = value >>> 0;
  }
  return table;
})();

const crc32 = (bytes: Uint8Array) => {
  let crc = 0xffffffff;
  for (let i = 0; i < bytes.length; i += 1) {
    crc = CRC_TABLE[(crc ^ bytes[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
};

interface ZipEntry {
  name: string;
  /** Explicitly backed by an `ArrayBuffer` (not `SharedArrayBuffer`) so it is a valid `BlobPart`. */
  data: Uint8Array<ArrayBuffer>;
}

/** Builds a ZIP archive with every entry STORED (compression method 0). */
const buildZip = (entries: ZipEntry[], mimeType: string, now = new Date()): Blob => {
  const encoder = new TextEncoder();
  const dosTime = (now.getHours() << 11) | (now.getMinutes() << 5) | (now.getSeconds() >> 1);
  const dosDate = ((now.getFullYear() - 1980) << 9) | ((now.getMonth() + 1) << 5) | now.getDate();

  const localParts: BlobPart[] = [];
  const centralParts: BlobPart[] = [];
  let localSize = 0;

  entries.forEach((entry) => {
    const nameBytes = encoder.encode(entry.name);
    const crc = crc32(entry.data);
    const size = entry.data.length;

    const local = new Uint8Array(30 + nameBytes.length);
    const localView = new DataView(local.buffer);
    localView.setUint32(0, 0x04034b50, true); // local file header signature
    localView.setUint16(4, 20, true); // version needed
    localView.setUint16(6, 0x0800, true); // flags: UTF-8 file names
    localView.setUint16(8, 0, true); // method: stored
    localView.setUint16(10, dosTime, true);
    localView.setUint16(12, dosDate, true);
    localView.setUint32(14, crc, true);
    localView.setUint32(18, size, true); // compressed size
    localView.setUint32(22, size, true); // uncompressed size
    localView.setUint16(26, nameBytes.length, true);
    local.set(nameBytes, 30);

    const central = new Uint8Array(46 + nameBytes.length);
    const centralView = new DataView(central.buffer);
    centralView.setUint32(0, 0x02014b50, true); // central directory signature
    centralView.setUint16(4, 20, true); // version made by
    centralView.setUint16(6, 20, true); // version needed
    centralView.setUint16(8, 0x0800, true);
    centralView.setUint16(10, 0, true);
    centralView.setUint16(12, dosTime, true);
    centralView.setUint16(14, dosDate, true);
    centralView.setUint32(16, crc, true);
    centralView.setUint32(20, size, true);
    centralView.setUint32(24, size, true);
    centralView.setUint16(28, nameBytes.length, true);
    centralView.setUint32(42, localSize, true); // offset of the local header
    central.set(nameBytes, 46);

    localParts.push(local, entry.data);
    centralParts.push(central);
    localSize += local.length + size;
  });

  const centralSize = centralParts.reduce(
    (total, part) => total + (part as Uint8Array).length,
    0
  );

  const end = new Uint8Array(22);
  const endView = new DataView(end.buffer);
  endView.setUint32(0, 0x06054b50, true); // end of central directory signature
  endView.setUint16(8, entries.length, true);
  endView.setUint16(10, entries.length, true);
  endView.setUint32(12, centralSize, true);
  endView.setUint32(16, localSize, true);

  return new Blob([...localParts, ...centralParts, end], { type: mimeType });
};

// ─── PUBLIC API ──────────────────────────────────────────────────────────────

/** Excel rejects `[]:*?/\` in sheet names and truncates anything past 31 characters. */
const safeSheetName = (name: string) => {
  const cleaned = name.replace(/[[\]:*?/\\]/g, ' ').trim();
  return (cleaned || 'Sheet1').slice(0, 31);
};

/** Strips the characters Windows and macOS reject in a file name. */
const safeFileName = (name: string) => {
  // eslint-disable-next-line no-control-regex
  const cleaned = name.replace(/[<>:"/\\|?*\u0000-\u001F]/g, '-').trim();
  return cleaned || 'export';
};

/** Builds the workbook as a Blob. Exported separately so it can be unit-tested without a DOM. */
export const buildXlsxBlob = <TRow>({
  sheetName = 'Sheet1',
  columns,
  rows,
}: Omit<XlsxExportOptions<TRow>, 'fileName'>): Blob => {
  const encoder = new TextEncoder();
  const entries: ZipEntry[] = [
    { name: '[Content_Types].xml', data: encoder.encode(CONTENT_TYPES_XML) },
    { name: '_rels/.rels', data: encoder.encode(ROOT_RELS_XML) },
    { name: 'xl/workbook.xml', data: encoder.encode(workbookXml(safeSheetName(sheetName))) },
    { name: 'xl/_rels/workbook.xml.rels', data: encoder.encode(WORKBOOK_RELS_XML) },
    { name: 'xl/styles.xml', data: encoder.encode(STYLES_XML) },
    { name: 'xl/worksheets/sheet1.xml', data: encoder.encode(worksheetXml(columns, rows)) },
  ];

  return buildZip(entries, XLSX_MIME);
};

/** Builds the workbook and hands it to the browser as a download. */
export const exportToXlsx = <TRow>({ fileName, ...rest }: XlsxExportOptions<TRow>): void => {
  const blob = buildXlsxBlob(rest);
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = objectUrl;
  link.download = `${safeFileName(fileName)}.xlsx`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(objectUrl);
};
