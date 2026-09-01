import { MongoClient, type Db } from 'mongodb'

type MongoCache = { client: MongoClient; db: Db }

declare global {
  // eslint-disable-next-line no-var
  var __wobartMongo: MongoCache | undefined
}

export async function getMongoDb(): Promise<Db> {
  if (globalThis.__wobartMongo) return globalThis.__wobartMongo.db

  const mongoUri = process.env.MONGO_URL
  const databaseName = process.env.DB_NAME
  if (!mongoUri) throw new Error('MONGO_URL is not configured')
  if (!databaseName) throw new Error('DB_NAME is not configured')

  const client = new MongoClient(mongoUri)
  await client.connect()
  const db = client.db(databaseName)
  globalThis.__wobartMongo = { client, db }
  return db
}
