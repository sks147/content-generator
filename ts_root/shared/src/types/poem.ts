export interface PoemInput {
	theme: string;
	style: string;
	length: string;
	content: string;
}

export interface Poem extends PoemInput {
	id: number;
	/** ISO 8601 string. Postgres returns a Date; the db layer serializes it before it crosses the wire. */
	created_at: string;
}
