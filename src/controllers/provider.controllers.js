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

// For provider to sign up (refactored)
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

// router.post("/", async (req, res) => {
//   const data = req.body;

//   const validationErrors = validateProvider(data);

//   if (Object.keys(validationErrors).length != 0)
//     return res.status(400).send({
//       error: validationErrors,
//     });

//   data.password = bcrypt.hashSync(data.password, 8);

//   prisma.provider
//     .create({
//       data,
//     })
//     .then((provider) => {
//       return res.json(
//         filter(
//           provider,
//           "id",
//           "name",
//           "email",
//           "hourly_rate",
//           "description",
//           "photo_url"
//         )
//       );
//     })
//     .catch((err) => {
//       if (
//         err instanceof Prisma.PrismaClientKnownRequestError &&
//         err.code === "P2002"
//       ) {
//         const formattedError = {};
//         formattedError[`${err.meta.target[0]}`] = "already taken";

//         return res.status(500).send({
//           error: formattedError,
//         });
//       }
//       throw err;
//     });
// });

router.get("/", async (req, res) => {
  const allUsers = await prisma.provider.findMany();
  res.json(allUsers);
});



// To show provider's profile
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

router.patch("/:id", auth, async (req, res) => {
  const id = req.params.id;
  // const validationErrors = editProvider(data);
  // if (Object.keys(validationErrors).length != 0)
  //   return res.status(400).send({
  //     error: validationErrors,
  //   });
  prisma.provider
    .update({
      where: { id: parseInt(id) },
      data: req.body,
    })
    .then((provider) => {
      return res.json(
        filter(
          provider,
          "name",
          "email",
          "hourly_rate",
          "description",
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
        formattedError["${err.meta.target[0]}"] = "already taken";
        return res.status(500).send({
          error: formattedError,
        }); // friendly error handling
      }
      throw err;
    });
});

export default router;
