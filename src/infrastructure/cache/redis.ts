import { createClient } from 'redis'

const client = createClient()

export async function connectRedis() {
  client.on('error', (err) => console.log('Redis Client Error', err))
  client.on('ready', () => console.log('Redis Client Connected'))
  client.connect()

  return client
}
