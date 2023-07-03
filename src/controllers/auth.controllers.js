import express from "express"
import prisma from "../utils/prisma.js"
import bcrypt from "bcryptjs"
import { validateAuth } from "../validators/auth.js"
import { signAccessToken } from "../utils/jwt.js"

const router = express.Router();

router.post('/', async (req, res) => {
  const data = req.body

  const validationErrors = validateAuth(data)

  if (Object.keys(validationErrors).length != 0) return res.status(401).send({
    error: validationErrors
  })

  const user = await prisma.user.findUnique({
    where: {
      email: data.email
    }
  })

  if (!user) return res.status(401).send({
    error: 'Email address or password not valid'
  })

  const checkPassword = bcrypt.compareSync(data.password, user.password)
  if (!checkPassword) return res.status(401).send({
    error: 'Email address or password not valid'
  })

  const accessToken = await signAccessToken(user)
  const userId = user.id
  return res.json({ accessToken, userId })
})

export default router