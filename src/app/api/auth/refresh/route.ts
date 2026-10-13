import { NextResponse } from 'next/server';
import { API_CONFIG, API_ENDPOINTS } from '@/constants';

const parseResponseBody = async (response: Response): Promise<unknown> => {
  try {
    return await response.clone().json();
  } catch {
    try {
      return await response.clone().text();
    } catch {
      return null;
    }
  }
};

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { refresh?: string } | null;
  const refresh = body?.refresh?.trim();

  if (!refresh) {
    return NextResponse.json({ detail: 'Refresh token is required.' }, { status: 400 });
  }

  const backendResponse = await fetch(`${API_CONFIG.BASE_URL}${API_ENDPOINTS.AUTH.REFRESH}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ refresh }),
  });

  const responseBody = await parseResponseBody(backendResponse);

  if (responseBody === null) {
    return new NextResponse(null, { status: backendResponse.status });
  }

  return NextResponse.json(responseBody, { status: backendResponse.status });
}
