import { Client } from 'pg';
import dotenv from 'dotenv';
dotenv.config({
	quiet: true,
	path: '.env',
});

const pgClient = new Client({ connectionString: process.env.DATABASE_URL });
await pgClient.connect();

export default pgClient;
