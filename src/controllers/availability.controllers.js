import express from "express"
import prisma from "../utils/prisma.js"
import auth from "../middleware/auth.js";

const router = express.Router();

router.post("/", auth, async (req, res) => {
  try {
    const availability = req.body.availability;

    for (const entry of availability) {
      const { day, startAt, endAt } = entry;

      await prisma.provider_Avalibility.create({
        data: {
          day: day,
          start_at: startAt,
          end_at: endAt,
          provider_id: req.user.payload.id,
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