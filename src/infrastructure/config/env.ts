function required(name: string) {
  const value = process.env[name]
  if (!value) {
    throw new Error(`Environment variable ${name} is required`)
  }
  return value
}

export const env = {
  DATABASE_URL: required('DATABASE_URL'),
  NODE_ENV: process.env.NODE_ENV ?? 'development',
  PORT: Number(process.env.PORT ?? 3000),
}
