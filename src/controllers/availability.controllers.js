import express from "express"
import prisma from "../utils/prisma.js"
import auth from "../middleware/auth.js";

const router = express.Router();

// For providers to set their availability
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

router.delete('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const result = await prisma.provider_Avalibility.delete({
            where: {
                id: parseInt(id),
            },
        });

        res.status(200).json({ message: "Successfully deleted record", result });
    } catch (error) {
        res.status(500).json({ error: "Error deleting the record", details: error });
    }
});

router.get('/', async (req, res) => {
    try {
        const result = await prisma.provider_Avalibility.findMany();
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ error: "Error fetching the records", details: error });
    }
});

export default router