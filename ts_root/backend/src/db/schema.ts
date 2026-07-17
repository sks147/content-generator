import sql from './connection.ts';

export async function initializeSchema(): Promise<void> {
	await sql`
		CREATE TABLE IF NOT EXISTS poems (
			id         SERIAL PRIMARY KEY,
			theme      TEXT NOT NULL,
			style      TEXT NOT NULL DEFAULT 'free_verse',
			length     TEXT NOT NULL DEFAULT 'medium',
			content    TEXT NOT NULL,
			created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
		)
	`;
}
