import { PrismaClient } from '@prisma/client'
import { generateHash } from "../src/backend/utils/passwordHash"

const init = async () => {
  const prisma = new PrismaClient()
  await prisma.$connect()

  const login = process.env.ROOT_LOGIN || "root"
  const password = await generateHash(process.env.ROOT_PASSWORD || "123123")
  const user = await prisma.adminUser.upsert({
    where: { login },
    update: { login, password },
    create: { login, password }
  })
  console.info (`User ${user.login} successfull created!`)
}

init()