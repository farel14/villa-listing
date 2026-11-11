import "server-only";

const API_URL = process.env.API_URL ?? "http://localhost:4000/api";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

type ApiInit = Omit<RequestInit, "body"> & {
  token?: string;
  body?: unknown;
  revalidate?: number;
};

/** Server-side fetch to the NestJS API. Throws ApiError on non-2xx. */
export async function api<T>(path: string, init: ApiInit = {}): Promise<T> {
  const { token, body, revalidate, headers, ...rest } = init;
  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      ...rest,
      headers: {
        ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers,
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
      ...(revalidate !== undefined ? { next: { revalidate } } : { cache: "no-store" }),
    });
  } catch {
    throw new ApiError(503, "API unreachable");
  }
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const msg = Array.isArray(data?.message) ? data.message.join(", ") : data?.message;
    throw new ApiError(res.status, msg ?? res.statusText);
  }
  return data as T;
}
