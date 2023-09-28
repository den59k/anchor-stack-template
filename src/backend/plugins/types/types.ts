import { User } from "@prisma/client"
import fp from "fastify-plugin"

declare module 'fastify' {
  interface FastifyRequest {
    currentUser: Pick<User, "id">
  }
}

export default fp(async (fastify) => {
  fastify.decorateRequest("currentUser", null)
})