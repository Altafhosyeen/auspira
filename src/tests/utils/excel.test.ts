import { describe, expect, it } from 'vitest';
import { buildXlsxBlob } from '@/lib/utils/excel';

interface Row {
  ref: string;
  raised: Date;
  count: number;
  note: string | null;
}

const columns = [
  { header: 'Reference', value: (row: Row) => row.ref },
  { header: 'Raised', value: (row: Row) => row.raised },
  { header: 'Count', value: (row: Row) => row.count },
  { header: 'Note', value: (row: Row) => row.note },
];

const rows: Row[] = [
  { ref: 'EW-001', raised: new Date(2026, 5, 27), count: 3, note: 'Ground & <water> ingress' },
  { ref: 'EW-002', raised: new Date(2026, 6, 1), count: 0, note: null },
];

/** Entries are STORED, so every part sits verbatim in the archive and can be read back as text. */
const readArchive = async (blob: Blob) => new TextDecoder().decode(await blob.arrayBuffer());

/**
 * Walks the zip central directory the way a real reader does — the end-of-central-directory record
 * is the last 22 bytes (no archive comment), and each entry there points at its local header.
 */
const listEntries = async (blob: Blob) => {
  const bytes = new Uint8Array(await blob.arrayBuffer());
  const view = new DataView(bytes.buffer);
  const end = bytes.length - 22;

  expect(view.getUint32(end, true)).toBe(0x06054b50);
  const total = view.getUint16(end + 8, true);
  let offset = view.getUint32(end + 16, true);

  const decoder = new TextDecoder();
  const names: string[] = [];

  for (let i = 0; i < total; i += 1) {
    expect(view.getUint32(offset, true)).toBe(0x02014b50);
    const nameLength = view.getUint16(offset + 28, true);
    const localOffset = view.getUint32(offset + 42, true);

    // Every central entry must point at a matching local header.
    expect(view.getUint32(localOffset, true)).toBe(0x04034b50);

    names.push(decoder.decode(bytes.subarray(offset + 46, offset + 46 + nameLength)));
    offset += 46 + nameLength + view.getUint16(offset + 30, true) + view.getUint16(offset + 32, true);
  }

  // The central directory must end exactly where the EOCD record begins.
  expect(offset).toBe(end);
  return names;
};

describe('buildXlsxBlob', () => {
  it('produces a readable zip container with the six OOXML parts', async () => {
    const blob = buildXlsxBlob({ sheetName: 'Register', columns, rows });

    expect(blob.type).toBe('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    expect(await listEntries(blob)).toEqual([
      '[Content_Types].xml',
      '_rels/.rels',
      'xl/workbook.xml',
      'xl/_rels/workbook.xml.rels',
      'xl/styles.xml',
      'xl/worksheets/sheet1.xml',
    ]);
  });

  it('writes a bold header row and one row per record', async () => {
    const text = await readArchive(buildXlsxBlob({ columns, rows }));

    expect(text).toContain('<c r="A1" s="1" t="inlineStr"><is><t xml:space="preserve">Reference');
    expect(text).toContain('<row r="2">');
    expect(text).toContain('<row r="3">');
    expect(text).not.toContain('<row r="4">');
    expect(text).toContain('<autoFilter ref="A1:D3"/>');
  });

  it('writes dates as serial numbers and numbers as numeric cells', async () => {
    const text = await readArchive(buildXlsxBlob({ columns, rows }));

    // 27 Jun 2026 is serial 46200 counting from Excel's 30 Dec 1899 epoch.
    expect(text).toContain('<c r="B2" s="2"><v>46200</v></c>');
    expect(text).toContain('<c r="C2"><v>3</v></c>');
    // Zero must still be written — it is a value, not a blank.
    expect(text).toContain('<c r="C3"><v>0</v></c>');
  });

  it('escapes markup and leaves empty cells for null values', async () => {
    const text = await readArchive(buildXlsxBlob({ columns, rows }));

    expect(text).toContain('Ground &amp; &lt;water&gt; ingress');
    expect(text).toContain('<c r="D3"/>');
  });

  it('strips characters Excel would reject in the sheet name', async () => {
    const text = await readArchive(
      buildXlsxBlob({ sheetName: 'EW Register: Active/Archived', columns, rows })
    );

    expect(text).toContain('<sheet name="EW Register  Active Archived" sheetId="1"');
  });
});
