import dotenv from 'dotenv'
import { createApp } from './app'
dotenv.config()

const app = createApp({ bodyLimit: 128 * 1024 })

const start = async () => {
  try {
    const port = parseInt(process.env.PORT ?? "3001")
    const time = Date.now()
    const address = await app.listen({ port, host: process.env.HOST ?? "0.0.0.0" })

    const launchTime = Math.floor((Date.now() - time) / 100) / 10
    console.info(`Server launched on ${address}. Launch time: ${launchTime}s`)
  } catch(err) {
    console.error(err)
    process.exit(1)
  }
}

start()
