import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { NextResponse } from 'next/server';
import { getCleanUrl } from '@/lib/utils/urls';

export const runtime = 'nodejs';

interface SaveTestDataPayload {
  endpoint?: string;
  payload?: unknown;
}

const isMockWriteEnabled = () => {
  return process.env.NODE_ENV !== 'production';
};

export async function POST(request: Request) {
  if (!isMockWriteEnabled()) {
    return NextResponse.json({ error: 'Mock data writes are disabled.' }, { status: 403 });
  }

  let body: SaveTestDataPayload;

  try {
    body = (await request.json()) as SaveTestDataPayload;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const endpoint = typeof body.endpoint === 'string' ? body.endpoint : '';
  const cleanEndpoint = getCleanUrl(endpoint);

  if (!cleanEndpoint) {
    return NextResponse.json({ error: 'Endpoint is required.' }, { status: 400 });
  }

  const relativeFolder = path.join('test_data', ...cleanEndpoint.split('/').filter(Boolean));
  const folderPath = path.join(process.cwd(), relativeFolder);
  const filePath = path.join(folderPath, 'response.json');

  await mkdir(folderPath, { recursive: true });
  await writeFile(filePath, JSON.stringify(body.payload ?? null, null, 2), 'utf-8');

  return NextResponse.json({
    saved: true,
    path: path.posix.join('test_data', cleanEndpoint, 'response.json'),
  });
}
