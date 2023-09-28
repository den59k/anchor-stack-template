import { PrismaClient } from '@prisma/client'
import { generateHash } from "../src/backend/utils/passwordHash"

const init = async () => {
  const prisma = new PrismaClient()
  await prisma.$connect()

  const password = await generateHash("123123")
  const user = await prisma.user.upsert({
    where: { login: "root" },
    update: { login: "root", password },
    create: { login: "root", password }
  })
  console.info (`User ${user.login} successfull created!`)
}

init()