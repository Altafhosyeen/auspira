import { NextRequest } from 'next/server';

// Same-origin proxy for remote document files (Azure blob SAS URLs).
// react-pdf fetches the PDF with fetch(), which enforces CORS — Azure blobs
// typically don't send CORS headers, so the browser fetch fails. Streaming the
// file through this route makes it same-origin (no CORS) for the browser while
// the server-to-server fetch to Azure is unrestricted.

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Only proxy Azure blob storage hosts to avoid an open proxy / SSRF. */
function isAllowedHost(url: URL): boolean {
  return url.protocol === 'https:' && url.hostname.endsWith('.blob.core.windows.net');
}

export async function GET(request: NextRequest) {
  const target = request.nextUrl.searchParams.get('url');
  if (!target) {
    return new Response('Missing url parameter', { status: 400 });
  }

  let parsed: URL;
  try {
    parsed = new URL(target);
  } catch {
    return new Response('Invalid url parameter', { status: 400 });
  }

  if (!isAllowedHost(parsed)) {
    return new Response('URL host is not allowed', { status: 403 });
  }

  let upstream: Response;
  try {
    upstream = await fetch(parsed.toString(), {
      // Forward Range so the browser's PDF viewer can request byte ranges.
      headers: request.headers.get('range') ? { range: request.headers.get('range')! } : undefined,
      cache: 'no-store',
    });
  } catch {
    return new Response('Failed to fetch file', { status: 502 });
  }

  if (!upstream.ok || !upstream.body) {
    return new Response('Upstream file error', { status: upstream.status || 502 });
  }

  const headers = new Headers();
  // Note: `content-disposition` is deliberately NOT forwarded — Azure can send
  // `attachment`, which would make the browser download the file instead of
  // rendering it inline in the PDF viewer.
  const passthrough = ['content-length', 'content-range', 'accept-ranges', 'last-modified', 'etag'];
  for (const key of passthrough) {
    const value = upstream.headers.get(key);
    if (value) headers.set(key, value);
  }

  // Coerce the content type so the browser's built-in PDF viewer renders the
  // file inline. Azure blobs frequently report `application/octet-stream`,
  // which browsers download instead of displaying. Preserve any other explicit
  // type (e.g. images) unchanged.
  const upstreamType = upstream.headers.get('content-type');
  const isPdfUrl = parsed.pathname.toLowerCase().endsWith('.pdf');
  if (!upstreamType || upstreamType === 'application/octet-stream' || isPdfUrl) {
    headers.set('content-type', 'application/pdf');
  } else {
    headers.set('content-type', upstreamType);
  }

  headers.set('content-disposition', 'inline');
  headers.set('cache-control', 'private, max-age=60');

  return new Response(upstream.body, { status: upstream.status, headers });
}
