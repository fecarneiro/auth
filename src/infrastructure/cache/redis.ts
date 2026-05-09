import redis from 'redis'

export async function startRedis() {
  await redis
    .createClient()
    .on('error', (err) => {
      console.log('Redis Client Error', err)
      process.exit(1)
    })
    .on('ready', () => console.log('Redis Client Started'))
    .connect()
}
