import type { Poem, PoemListResponse, CreatePoemParams } from 'shared'
import { apiFetch } from './client'

export async function fetchPoems(
  limit = 20,
  offset = 0,
): Promise<PoemListResponse> {
  const params = new URLSearchParams({
    limit: String(limit),
    offset: String(offset),
  })
  return apiFetch<PoemListResponse>(`/api/poems?${params.toString()}`)
}

export async function createPoem(
  params: CreatePoemParams,
): Promise<Poem> {
  return apiFetch<Poem>('/api/poems', {
    method: 'POST',
    body: JSON.stringify(params),
  })
}

export async function fetchPoem(id: number): Promise<Poem> {
  return apiFetch<Poem>(`/api/poems/${id}`)
}
