import { app } from './app.js'
import './config/env.js'
import { connectRedis } from './infrastructure/cache/redis.js'

const port = Number(process.env.PORT ?? 3000)
export const redisClient = await connectRedis()

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`)
})
