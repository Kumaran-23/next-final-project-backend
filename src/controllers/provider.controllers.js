import express from 'express'
import bcrypt from "bcryptjs"
import { Prisma } from "@prisma/client"
import prisma from "../utils/prisma.js"
import { validateProvider } from "../validators/provider.js"
import { filter } from "../utils/common.js"
const router = express.Router()

router.post('/', async (req, res) => {
  const data = req.body

  const validationErrors = validateProvider(data)

  if (Object.keys(validationErrors).length != 0) return res.status(400).send({
    error: validationErrors
  })

  data.password = bcrypt.hashSync(data.password, 8);

  prisma.provider.create({
    data
  }).then(provider => {
    return res.json(filter(provider, 'id', 'name', 'email', 'hourly_rate', 'description', 'photo_url'))

  }).catch(err => {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      const formattedError = {}
      formattedError[`${err.meta.target[0]}`] = 'already taken'

      return res.status(500).send({
        error: formattedError
      })
    }
    throw err
  })
})

router.get('/', async (req, res) => {
  const allUsers = await prisma.provider.findMany()
  res.json(allUsers)
})

export default router