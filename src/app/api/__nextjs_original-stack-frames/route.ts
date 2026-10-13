import { NextResponse } from 'next/server';

export async function POST() {
  // Acknowledge overlay stack-frame POSTs from the dev client.
  // Return 204 to keep logs quieter and avoid returning JSON payloads.
  return new NextResponse(null, { status: 204 });
}
