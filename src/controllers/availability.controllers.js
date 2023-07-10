import express from "express"
import prisma from "../utils/prisma.js"

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { providerId, availability } = req.body;
    console.log(req.body);

    for (const entry of availability) {
      const { day, startAt, endAt } = entry;

      await prisma.provider_Avalibility.create({
        data: {
          day: day,
          start_at: startAt,
          end_at: endAt,
          provider: {
            connect: { id: parseInt(providerId) },
          },
        }
      });
    };
    
    res.status(200).json({ message: "Availability created", availability });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error creating availability" });
  }
});

export default router