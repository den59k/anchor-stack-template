import { PrismaClient } from "@prisma/client";

declare module 'fastify' {
  interface FastifyReply {
    error (payload: any, code?: number): FastifyReply
  }
}