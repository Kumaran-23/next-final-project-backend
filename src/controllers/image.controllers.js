import express from "express";
import prisma from "../utils/prisma.js";
import { Prisma } from "@prisma/client"
import auth from "../middleware/auth.js";
const router = express.Router();

router.post('/', auth, async (req, res) => {
    const data = req.body;

    const test = {...data, provider_id: req.user.payload.id}
    console.log(test)

    console.log(data);
    console.log(typeof req.user.payload.id)
    prisma.provider_Image.create({
        data:{
            ...data,
            provider_id: parseInt(req.user.payload.id)
        }
    }).then(image => {
        return res.json(image);
        
    })
    .catch(err => {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      const formattedError = {}
      formattedError[`${err.meta.target[0]}`] = 'already taken'

      return res.status(500).send({
        error: formattedError
      });
    }
    throw err
  })
})

router.get("/", async (req, res) => {
  await prisma.provider_image.findMany().then((image) => {
    return res.json(image);
  });
});

router.get("/:provider_id", async (req,res) => {
  const provider_id = parseInt(req.params.provider_id)
  const image = await prisma.provider_Image.findMany({
    where: {
      provider_id: provider_id
    }
  })
  return res.json(image);
})

router.delete('/:id', auth, async (req, res) => {
  const image = await prisma.provider_Image.findUnique({
    where: {
      id: parseInt(req.params.id)
    }
  })
  if (req.user.payload.id != image.provider_id) {
      return res.status(401).send({"error": "Unauthorized"})
  }
  else {
     await prisma.provider_Image.delete({
      where: {
        id: parseInt(req.params.id)
      }
    })
    res.status(200).json({ message: 'Entry deleted successfully.' });
  }
})

export default router;

