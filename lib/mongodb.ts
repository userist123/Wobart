import { MongoClient, type Db } from 'mongodb'

const uri = process.env.MONGO_URL
const dbName = process.env.DB_NAME

if (!uri) throw new Error('MONGO_URL is not configured')
if (!dbName) throw new Error('DB_NAME is not configured')

type MongoCache = { client: MongoClient; db: Db }

declare global {
  // eslint-disable-next-line no-var
  var __wobartMongo: MongoCache | undefined
}

export async function getMongoDb(): Promise<Db> {
  if (globalThis.__wobartMongo) return globalThis.__wobartMongo.db
  const client = new MongoClient(uri)
  await client.connect()
  const db = client.db(dbName)
  globalThis.__wobartMongo = { client, db }
  return db
}
