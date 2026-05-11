import { createClient } from 'redis'

export const redisClient = createClient()

redisClient.on('error', (err) => console.log('Redis Client Error', err))
redisClient.on('ready', () => console.log('Redis Client Connected'))

await redisClient.connect()
