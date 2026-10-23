import type { ApiErrorBody } from '@fieldmedic/shared';

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: ApiErrorBody['code'] | 'NETWORK',
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/** Single place for HTTP calls: base URL, headers and error handling live here, not in components. */
async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`/api${path}`, {
      ...init,
      headers: { Accept: 'application/json', 'Content-Type': 'application/json', ...init?.headers },
    });
  } catch {
    throw new ApiError(0, 'NETWORK', 'Network error');
  }

  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as ApiErrorBody | null;
    throw new ApiError(res.status, body?.code ?? 'INTERNAL', body?.error ?? res.statusText);
  }
  return (await res.json()) as T;
}

export const apiGet = <T>(path: string) => request<T>(path);

export const apiPost = <T>(path: string, body: unknown) =>
  request<T>(path, { method: 'POST', body: JSON.stringify(body) });
