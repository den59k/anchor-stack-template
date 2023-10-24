import { FastifyInstance } from "fastify"
import { HTTPError } from "../../utils/HTTPError"
import { sc, schema } from "../../utils/schema"
import { generateHash } from "../../utils/passwordHash"
import { uid } from "uid"
import { useAuth } from "../../hooks/useAuth"

/** Account
 * @description Routes for admin-panel
 * @order 100
 */
export default async (fastify: FastifyInstance) => {

  const loginSchema = schema({ login: "string", password: "string" }, "body")
  /** Login to app */
  fastify.post("/login", sc(loginSchema), async (req) => {

    const { login, password } = req.body as any

    const user = await fastify.prisma.adminUser.findUnique({ where: { login }})
    if (!user) throw new HTTPError({ login: { code: "auth.wrongLogin", message: "Wrong login" } })
  
    const hash = await generateHash(password)
    if (!hash.equals(user.password)) throw new HTTPError({ password: { code: "auth.wrongPassword", message: "Wrong password" } })
  
    if (user.token) return { id: user.id, login: user.login, accessToken: user.token }
    
    const token = uid(40)
    await fastify.prisma.adminUser.update({ where: { id: user.id }, data: { token } })
    return { id: user.id, login: user.login, accessToken: token }
  })

  /** Get account data */
  fastify.get("/account", { onRequest: useAuth }, async (req) => {
    const user = await fastify.prisma.adminUser.findUnique({ select: { id: true, login: true }, where: { id: req.currentUser.id }})
    return user
  })
}