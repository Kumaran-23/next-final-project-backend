import express from "express"
import prisma from "../utils/prisma.js"
import auth from "../middleware/auth.js";

const router = express.Router();

// For providers to edit their profile
router.patch("/", auth, async (req, res) => {
    try {
        const data = req.body;
        console.log(data)

        await prisma.provider.update({
            where: { id: req.user.payload.id },
            data: {
                photo_url: data.photo_url,
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

export default router