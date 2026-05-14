import '../config/env.js'
import { connectRedis } from '../session/redis.js'
import { app } from './app.js'

const port = Number(process.env.PORT ?? 3000)

await connectRedis()

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`)
})
