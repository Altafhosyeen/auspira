import fs from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const file = searchParams.get('file');

  if (!file) {
    return NextResponse.json({ error: 'file query is required' }, { status: 400 });
  }

  // Ensure safe file names; no directory traversal.
  if (!/^[a-zA-Z0-9._-]+\.tsx$/.test(file)) {
    return NextResponse.json({ error: 'invalid filename' }, { status: 400 });
  }

  const filePath = path.join(process.cwd(), 'components', 'examples', file);

  if (!fs.existsSync(filePath)) {
    return NextResponse.json({ error: 'file not found' }, { status: 404 });
  }

  const code = fs.readFileSync(filePath, 'utf8');
  return NextResponse.json({ code });
}
