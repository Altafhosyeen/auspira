import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { NextResponse } from 'next/server';
import { getCleanUrl } from '@/lib/utils/urls';

export const runtime = 'nodejs';

const isMockReadEnabled = () => {
  return process.env.NODE_ENV !== 'production';
};

export async function GET(request: Request) {
  if (!isMockReadEnabled()) {
    return NextResponse.json({ error: 'Mock data reads are disabled.' }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const endpoint = searchParams.get('endpoint') ?? '';
  const cleanEndpoint = getCleanUrl(endpoint);

  if (!cleanEndpoint) {
    return NextResponse.json({ error: 'Endpoint is required.' }, { status: 400 });
  }

  const filePath = path.join(
    process.cwd(),
    'test_data',
    ...cleanEndpoint.split('/').filter(Boolean),
    'response.json'
  );

  try {
    const content = await readFile(filePath, 'utf-8');
    return NextResponse.json(JSON.parse(content));
  } catch {
    return NextResponse.json({ error: 'Snapshot not found.' }, { status: 404 });
  }
}
