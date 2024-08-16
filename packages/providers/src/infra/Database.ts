import fs from 'fs';
import path from 'path';
import type { Database, DatabaseObject } from '../Types';

const dir = ".gate-roms";
const databaseDir = `${dir}`;
const databasePath = `${databaseDir}/database.json`;

export async function loadDatabase(): Promise<Database> {
   if (!fs.existsSync(databaseDir)) {
      fs.mkdirSync(databaseDir);
   }
   try {
      const rawDatabase = fs.readFileSync(databasePath, 'utf-8');
      return JSON.parse(rawDatabase);
   } catch (error) {
      console.error("Error loading database, returning new database", error);
      return {};
   }
}

export async function saveDatabase(database: Database) {
   if (!fs.existsSync(databaseDir)) {
      fs.mkdirSync(databaseDir);
   }
   fs.writeFileSync(databasePath, JSON.stringify(database));
}

export const defaultDatabaseObject: DatabaseObject = {
   save: saveDatabase,
   load: loadDatabase
}
