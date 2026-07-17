import type { Poem, PoemInput } from 'shared';
import sql from './connection.ts';

interface PoemRow extends PoemInput {
	id: number;
	created_at: Date;
}

const toPoem = (row: PoemRow): Poem => ({
	...row,
	created_at: row.created_at.toISOString(),
});

export async function insertPoem(input: PoemInput): Promise<Poem> {
	const [poem] = await sql<PoemRow[]>`
		INSERT INTO poems (theme, style, length, content)
		VALUES (${input.theme}, ${input.style}, ${input.length}, ${input.content})
		RETURNING *
	`;
	return toPoem(poem!);
}

export async function listPoems(
	limit: number,
	offset: number,
): Promise<{ poems: Poem[]; total: number }> {
	const poems = await sql<PoemRow[]>`
		SELECT * FROM poems ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}
	`;
	const [{ count }] = await sql<[{ count: string }]>`
		SELECT COUNT(*)::text AS count FROM poems
	`;
	return { poems: poems.map(toPoem), total: parseInt(count, 10) };
}

export async function getPoemById(id: number): Promise<Poem | undefined> {
	const [poem] = await sql<PoemRow[]>`
		SELECT * FROM poems WHERE id = ${id}
	`;
	return poem ? toPoem(poem) : undefined;
}
