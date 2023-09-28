import fastify, { FastifyServerOptions } from 'fastify'
import path from 'path'
import fastifyStatic from '@fastify/static'
import fastifyMultipart from '@fastify/multipart'

const plugins = import.meta.glob<any>('./plugins/**/*.ts', { eager: true })
const routes = import.meta.glob<any>('./routes/**/*.ts', { eager: true })

export const createApp = (opts?: FastifyServerOptions) => {
  const app = fastify(opts)

  app.decorate("user", null)
  app.decorate("deviceId", null)

  app.register(fastifyStatic, { prefix: "/uploads", root: path.join(__dirname, "../../public/uploads") })
  app.register(fastifyStatic, { prefix: "/static", root: path.join(__dirname, "../../public/static"), decorateReply: false })
  app.register(fastifyMultipart, { limits: { fileSize: 100 * 1024 * 1024 } })   // Limit - 100Mb
  
  app.register(fastifyStatic, { prefix: "/redoc", root: path.join(__dirname, "../../public/redoc"), decorateReply: false })
  app.get("/redoc", async (_req, reply) => reply.sendFile("index.html", path.join(__dirname, "../../public/redoc")))

  for (let plugin of Object.values(plugins)) {
    if (typeof plugin.default !== "function") continue
    app.register(plugin)
  }

  const routePrefix = "/api"
  for (let [ key, route ] of Object.entries(routes)) {
    if (typeof route.default !== "function") continue
    const path = key.slice("./routes/".length).split("/")
    app.register(route, { prefix: [ routePrefix, ...path.slice(0, -1) ].join("/") })
  }

  return app
}