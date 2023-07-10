import express from "express"
import prisma from "../utils/prisma.js"

const router = express.Router();

router.post("/", async (req, res) => {
    try {
      const { providerId, day, startAt, endAt } = req.body;
      console.log(req.body)
  
      const availability = await prisma.provider_Avalibility.create({
        data: {
          provider_id: providerId,
          day: day,
          start_at: startAt,
          end_at: endAt,
        },
      });
  
      res.status(200).json({ message: "Availability created", availability });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error creating availability" });
    }
});

export default router