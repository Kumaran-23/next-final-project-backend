import express from "express";
import bcrypt from "bcryptjs";
import { Prisma } from "@prisma/client";
import prisma from "../utils/prisma.js";
import { validateProvider } from "../validators/provider.js";
import { filter } from "../utils/common.js";
import { validateAuth } from "../validators/auth.js";
import { signAccessToken } from "../utils/jwt.js";
import auth from "../middleware/auth.js";
import { calculateDistance } from "../utils/distance.js";
const router = express.Router();

router.post("/", async (req, res) => {
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
        formattedError[`${err.meta.target[0]}`] = "already taken";

        return res.status(500).send({
          error: formattedError,
        });
      }
      throw err;
    });
});

router.get("/", async (req, res) => {
  const allUsers = await prisma.provider.findMany();
  res.json(allUsers);
});

router.post("/sign-in", async (req, res) => {
  const data = req.body;

  const validationErrors = validateAuth(data);

  if (Object.keys(validationErrors).length != 0)
    return res.status(401).send({
      error: validationErrors,
    });

  const provider = await prisma.provider.findUnique({
    where: {
      email: data.email,
    },
  });

  if (!provider)
    return res.status(401).send({
      error: "Email address or password not valid",
    });

  const checkPassword = bcrypt.compareSync(data.password, provider.password);
  if (!checkPassword)
    return res.status(401).send({
      error: "Email address or password not valid",
    });

  const accessToken = await signAccessToken(provider);
  const providerId = provider.id;
  return res.json({ accessToken, providerId });
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

app.post('/search', async (req, res) => {
    try {
        const userAddress = req.body.userAddress;
        const startTime = req.body.start_time;
        const endTime = req.body.end_time;
        const day = req.body.day;


        const providers = await prisma.provider.findMany({
            where: {
                hourly_rate: {
                    lte: parseInt(req.body.hourly_rate)
                },
                provider_location: {
                    some: {
                        address: {
                            contains: userAddress
                        }
                    }
                },
                provider_avalibility: {
                    some: {
                        AND: [
                            {
                                day: {
                                    equals: day
                                }
                            },
                            {
                                start_at: {
                                    lte: startTime
                                }
                            },
                            {
                                end_at: {
                                    gte: endTime
                                }
                            }
                        ]
                    }
                }
            },
            include: {
                provider_location: true,
                provider_avalibility: true
            }
        });

        // Filter the providers based on their travel distance
        const filteredProviders = [];
        for (const provider of providers) {
            for (const location of provider.provider_location) {
                const distance = await calculateDistance(userAddress, location.address);
                if (distance <= location.travel_distance) {
                    filteredProviders.push(provider);
                    break;
                }
            }
        }

        res.json(filteredProviders);
    } catch (error) {
        res.status(500).json({ error: 'Something went wrong' });
    }
});


export default router;
