import fp from 'fastify-plugin'
import { PrismaClient } from '@prisma/client'

export default fp(async (fasitfy) => {

  const prisma = new PrismaClient()
  await prisma.$connect()

  fasitfy.decorate('prisma', prisma)

  fasitfy.addHook('onClose', async () => {
    await fasitfy.prisma.$disconnect()
  })

}, { name: "prisma" })

const _bigIntPrototype = BigInt.prototype as any
_bigIntPrototype.toJSON = function() {
  return this.toString()
}