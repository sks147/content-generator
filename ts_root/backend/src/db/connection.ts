import postgres from 'postgres';

const sql = postgres({
	host: process.env['PGHOST'] ?? 'localhost',
	port: parseInt(process.env['PGPORT'] ?? '5432', 10),
	database: process.env['PGDATABASE'] ?? 'content_generator',
	username: process.env['PGUSER'] ?? 'postgres',
	password: process.env['PGPASSWORD'] ?? 'postgres',
});

export default sql;
