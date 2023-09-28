import { FastifyInstance } from "fastify";

export default async (fastify: FastifyInstance) => {

  fastify.get("/", async () => {
    return { status: "ok" }
  })

}