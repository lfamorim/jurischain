import ngrok from 'ngrok'
import express from 'express'
import { join } from 'path'

const DEFAULT_PORT = 8080
const defaultPort = process.env.SERVER_PORT
  ? parseInt(process.env.SERVER_PORT, 10)
  : DEFAULT_PORT

let serverPromise: Promise<string> | undefined

export async function initServer(port?: number): Promise<string> {
  if (serverPromise) return serverPromise

  const app = express()
  const usePort = port ?? defaultPort
  app.use(express.static(join(__dirname, '..', '..', 'examples', 'web')))
  app.use('/dist', express.static(join(__dirname, '..', '..', 'dist')))
  app.listen(usePort)

  serverPromise = ngrok.connect({
    proto: 'http',
    addr: usePort,
  })

  return serverPromise
}

export default initServer
