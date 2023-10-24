import { onRequestHookHandler } from "fastify"
import { HTTPError } from "../utils/HTTPError"

export const useAuth: onRequestHookHandler = async function (request, reply) {
 
  const str = request.headers["authorization"]?.split(" ")
  if (!str || str.length !== 2 || str[0] !== "Bearer") throw new HTTPError("Authorization required", 403) 
  
  const token = str[1]
  if (!token) throw new HTTPError("Wrong authorization token", 403) 
  
  const user = await this.prisma.adminUser.findUnique({ 
    select: { id: true }, 
    where: { token } 
  })
  if (!user) throw new HTTPError("Wrong authorization token", 403) 

  request.currentUser = user
}
