import express from "express";
import prisma from "../utils/prisma.js";
import { validateLocation } from "../validators/location.js";
import auth from "../middleware/auth.js";
const router = express.Router();

router.post("/", auth, async (req, res) => {
  const data = req.body;
  console.log(data);

  if (data.travel_distance) {
    data.travel_distance = parseInt(data.travel_distance, 10);
  }

  const validationErrors = validateLocation(data);

  if (Object.keys(validationErrors).length != 0)
    return res.status(400).send({
      error: validationErrors,
    });

  prisma.provider_Location
    .create({
      data: {
        ...data,
        provider_id: req.user.payload.id,
      },
    })
    .then((provider_Location) => {
      return res.json(provider_Location);
    });
});

router.get("/", async (req, res) => {
  const allLocation = await prisma.provider_Location.findMany();
  res.json(allLocation);
});

router.patch("/", auth, async (req, res) => {
  const data = req.body
  const validationErrors = validateLocation(data);

  if (Object.keys(validationErrors).length != 0)
    return res.status(400).send({
      error: validationErrors,
    });

  prisma.provider_Location
    .updateMany({
      where:{provider_id: req.user.payload.id},
      data
    })
    .then((provider_Location) => {
      return res.json(data);
    });
});

// For provider to add OR edit their location
router.post("/upsert", auth, async (req, res) => {
  const data = req.body;

  if (data.travel_distance) {
    data.travel_distance = parseInt(data.travel_distance, 10);
  }

  const validationErrors = validateLocation(data);

  if (Object.keys(validationErrors).length != 0)
    return res.status(400).send({
      error: validationErrors,
    });

  try {
    const providerLocation = await prisma.provider_Location.upsert({
      where: { provider_id: req.user.payload.id },
      update: data,
      create: {
        ...data,
        provider_id: req.user.payload.id,
      },
    });

    res.json(providerLocation);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update or create location' });
  }
});

export default router;
