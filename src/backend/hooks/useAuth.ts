import { onRequestHookHandler } from "fastify"

export const useAuth: onRequestHookHandler = async function (request, reply) {
 
  const str = request.headers["authorization"]?.split(" ")
  if (!str || str.length !== 2 || str[0] !== "Bearer") return reply.error({ token: "Authorization requred" })
  
  const token = str[1]
  if (!token) return reply.error({ token: "wrongToken" }, 401)
  
  const user = await this.prisma.user.findUnique({ 
    select: { id: true }, 
    where: { token } 
  })
  if (!user) return reply.error({ token: "wrongToken" }, 401)

  request.currentUser = user
}
