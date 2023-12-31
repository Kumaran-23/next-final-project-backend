import express from "express"
import prisma from "../utils/prisma.js"
import auth from "../middleware/auth.js";

const router = express.Router();

// To get a provider's availability
router.get('/:id', async (req, res) => {
  const providerId = parseInt(req.params.id);

  try {
    const availability = await prisma.provider_Avalibility.findMany({
      where: { provider_id: providerId }
    });
    console.log(availability);
    return res.json(availability);
  } catch (error) {
    console.error(error);
    return res.status(500).send({
      error: 'Error retrieving availability'
    });
  }
});

// For providers to create or edit their availability
router.post("/", auth, async (req, res) => {
  try {
    const availability = req.body.availability;

    for (const entry of availability) {
      const { day, start_at, end_at } = entry;

      await prisma.provider_Avalibility.upsert({
        where: {
          provider_id_day: {
            provider_id: req.user.payload.id,
            day: day
          }
        },
        update: {
          start_at: start_at,
          end_at: end_at,
        },
        create: {
          provider_id: req.user.payload.id,
          day: day,
          start_at: start_at,
          end_at: end_at,
        }
      });
    };
    
    res.status(200).json({ message: "Availability updated", availability });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating availability" });
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