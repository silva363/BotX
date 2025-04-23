import mysql, { Connection } from 'mysql2/promise';
import { settings } from './settings';

async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function createConnection(retries: number = 10, delay: number = 15000): Promise<Connection> {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      // If DATABASE_URL is provided, use it (PlanetScale format)
      if (settings.DATABASE_URL) {
        const conn = await mysql.createConnection(settings.DATABASE_URL);
        return conn;
      } else {
        // Fall back to traditional connection parameters
        const conn = await mysql.createConnection({
          host: settings.DB_HOST,
          database: settings.DB_DATABASE,
          user: settings.DB_USERNAME,
          password: settings.DB_PASSWORD
        });
        return conn;
      }
    } catch (error) {
      console.log(`createConnection error, attempt ${attempt + 1}`, error);
      if (attempt < retries - 1) {
        await sleep(delay);
      } else {
        throw error;
      }
    }
  }

  throw new Error('Unexpected error in createConnection');
}

async function doQuery(query: string, params: any[] = []) {
  const conn: Connection = await createConnection();
  
  try {
    const [rows] = await conn.query(query, params);
    return rows;
  } catch (error) {
    console.log('doQuery error', error);
    throw error;
  } finally {
    await conn.end();
  }
}

export default doQuery;
