import { app } from './app.js'
import './config/env.js'
import { startRedis } from './infrastructure/cache/redis.js'

const port = Number(process.env.PORT ?? 3000)

startRedis()

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`)
})
