const API_BASE_URL = import.meta.env['VITE_API_URL'] ?? 'http://localhost:3000'

export class ApiRequestError extends Error {
  constructor(
    public readonly status: number,
    public readonly body: unknown,
  ) {
    super(`API request failed with status ${status}`)
    this.name = 'ApiRequestError'
  }
}

export async function apiFetch<T>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  const url = `${API_BASE_URL}${path}`
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  })

  const body: unknown = await response.json()

  if (!response.ok) {
    throw new ApiRequestError(response.status, body)
  }

  return body as T
}
