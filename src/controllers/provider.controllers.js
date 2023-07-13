import express from "express";
import bcrypt from "bcryptjs";
import { Prisma } from "@prisma/client";
import prisma from "../utils/prisma.js";
import { validateProvider } from "../validators/provider.js";
import { filter } from "../utils/common.js";
import { validateAuth } from "../validators/auth.js";
import { signAccessToken } from "../utils/jwt.js";
import auth from "../middleware/auth.js";
const router = express.Router();

// For provider to sign up for a profile (refactored)
router.post("/sign-up", async (req, res) => {
  const data = req.body;

  const validationErrors = validateProvider(data);

  if (Object.keys(validationErrors).length != 0)
    return res.status(400).send({
      error: validationErrors,
  });

  data.password = bcrypt.hashSync(data.password, 8);

  prisma.provider
    .create({
      data,
    })
    .then((provider) => {
      return res.json(
        filter(
          provider,
          "id",
          "name",
          "email",
          "hourly_rate",
          "photo_url"
        )
      );
    })
    .catch((err) => {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === "P2002"
      ) {
        const formattedError = {};
        formattedError[`${err.meta.target[0]}`] = "Already taken";

        return res.status(500).send({
          error: formattedError,
        });
      }
      throw err;
    });
});

// For provider to login (refactored)
router.post("/login", async (req, res) => {
  const data = req.body;

  const validationErrors = validateAuth(data);

  if (Object.keys(validationErrors).length != 0)
    return res.status(401).send({
      error: validationErrors,
  });

  const provider = await prisma.provider.findUnique({
    where: {
      email: data.email
    }
  });

  if (!provider) return res.status(401).send({
    error: 'Email address or password not valid'
  });

  const checkPassword = bcrypt.compareSync(data.password, provider.password);
  if (!checkPassword) return res.status(401).send({
    error: 'Email address or password not valid'
  });

  const accessToken = await signAccessToken(provider);
  const providerId = provider.id;
  return res.json({ accessToken, providerId });
});

// To show provider's profile (refactored)
router.get('/:id', async (req, res) => {
  const providerId = parseInt(req.params.id);

  try {
    const provider = await prisma.provider.findUnique({
      where: { id: providerId },
      select: {
        id: true,
        name: true,
        email: true,
        hourly_rate: true,
        description: true,
        photo_url: true
      }
    });

    if (!provider) {
      return res.status(404).send({
        error: 'Provider not found'
      });
    }

    return res.json(provider);
  } catch (error) {
    console.error(error);
    return res.status(500).send({
      error: 'Internal server error'
    });
  }
});

// For provider to edit their profile (refactored)
router.patch("/update-profile", auth, async (req, res) => {
  try {
      const data = req.body;
      console.log(data)
      
      await prisma.provider.update({
          where: { id: req.user.payload.id },
          data: {
              photo_url: data.photo_url,
              name: data.name,
              hourly_rate: data.hourly_rate,
              description: data.description
          }
      });
  
      res.status(200).json({ message: "Profile updated" });
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error updating profile" });
  }
});

// To see list of all providers (refactored)
router.get("/all-providers", async (req, res) => {
  const allProviders = await prisma.provider.findMany();
  res.json(allProviders);
});

export default router;
