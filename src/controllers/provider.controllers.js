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
import { convertTo24Hour, convertTo12Hour } from "../utils/convert24hours.js";
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

// router.post('/search', async (req, res) => {
//     try {
//         const userAddress = req.body.userAddress;
//         const startTime = parseInt(req.body.start_time);
//         const endTime = parseInt(req.body.end_time);
//         const dateString = req.body.day;
        
//         const date = new Date(dateString);
//         const day = date.toLocaleDateString("en-US", { weekday: "short" });

//         console.log(1);
//         console.log(`User Address: ${userAddress}`);
//         console.log(`Day: ${day}`);
//         console.log(typeof startTime)
//         console.log(`Start Time: ${startTime}`);
//         console.log(typeof endTime)
//         console.log(`End Time: ${endTime}`);

//         // Get all providers with their locations and availabilities
//         const providers = await prisma.provider.findMany({
//             include: {
//                 provider_location: true,
//                 provider_avalibility: true
//             }
//         });

//         // Filter the providers based on their travel distance, day, and time availability
//         const filteredProviders = [];
//         for (const provider of providers) {
//             let isProviderAvailable = provider.provider_avalibility.some(avail => {
//                 let providerStartTime = parseInt(avail.start_at);
//                 let providerEndTime = parseInt(avail.end_at);

//                 // Check if the provider is available on the specified day
//                 if (avail.day.toLowerCase() === day.toLowerCase()) {
//                     // Check if the start time and end time are within the provider's availability range
//                     if (startTime >= providerStartTime && endTime <= providerEndTime) {
//                         return true;
//                     }
//                 }
//                 return false;
//             });

//             // filters providers based on their availability and travel distance, ensuring that only providers meeting both criteria are included in the filteredProviders.
//             if (isProviderAvailable) {
//                 for (const location of provider.provider_location) {
//                     console.log(`Calculating distance between ${userAddress} and ${location.address}`);
//                     const distance = await calculateDistance(userAddress, location.address);
//                     console.log(`Distance: ${distance}, Travel Distance: ${location.travel_distance}`);
//                     if (distance <= location.travel_distance) {
//                         filteredProviders.push(provider);
//                         break;
//                     }
//                 }
//             }
//         }

//         // Remove duplicate providers based on their IDs
//         const uniqueProviders = Array.from(new Set(filteredProviders.map(provider => provider.id))).map(id => {
//             return filteredProviders.find(provider => provider.id === id);
//         });

//         console.log(2);
//         console.log(uniqueProviders);
//         return res.json(uniqueProviders);
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ error: error.toString() });
//     }
// });

router.post('/search', async (req, res) => {
    try {
        const userAddress = req.body.userAddress;
        const startTime = parseInt(req.body.start_time);
        const endTime = parseInt(req.body.end_time);
        const dateString = req.body.day;
        
        const date = new Date(dateString);
        const day = date.toLocaleDateString("en-US", { weekday: "short" });

        console.log(`User Address: ${userAddress}`);
        console.log(`Day: ${day}`);
        console.log(typeof startTime)
        console.log(`Start Time: ${startTime}`);
        console.log(typeof endTime)
        console.log(`End Time: ${endTime}`);

        // Get all providers with their locations, availabilities and bookings
        const providers = await prisma.provider.findMany({
            include: {
                provider_location: true,
                provider_avalibility: true,
                booking: true
            }
        });

        // Filter the providers based on their travel distance, day, and time availability and if they have not been booked yet
        const filteredProviders = [];
        for (const provider of providers) {
            // Checks if the provider is already booked at the requested time
            const isAlreadyBooked = provider.booking.some(booking => {
                const bookingDate = new Date(booking.booking_date).toLocaleDateString();
                if (bookingDate === date.toLocaleDateString()) {
                    let bookingStartTime = parseInt(booking.booking_starttime);
                    let bookingEndTime = parseInt(booking.booking_endtime);
                    if ((startTime >= bookingStartTime && startTime < bookingEndTime) ||
                        (endTime > bookingStartTime && endTime <= bookingEndTime)) {
                          console.log(`Provider ${provider.id} is already booked from ${booking.booking_starttime} to ${booking.booking_endtime} on ${bookingDate}`);
                        return true;
                    }
                }
                return false;
            });

            // Skip the provider if they are already booked at the requested time
            if (isAlreadyBooked) {
                continue;
            }

            let isProviderAvailable = provider.provider_avalibility.some(avail => {
                let providerStartTime = parseInt(avail.start_at);
                let providerEndTime = parseInt(avail.end_at);

                // Check if the provider is available on the specified day
                if (avail.day.toLowerCase() === day.toLowerCase()) {
                    // Check if the start time and end time are within the provider's availability range
                    if (startTime >= providerStartTime && endTime <= providerEndTime) {
                        return true;
                    }
                }
                return false;
            });

            // Filters providers based on their availability and travel distance, ensuring that only providers meeting both criteria are included in the filteredProviders.
            if (isProviderAvailable) {
                for (const location of provider.provider_location) {
                    console.log(`Calculating distance between ${userAddress} and ${location.address}`);
                    const distance = await calculateDistance(userAddress, location.address);
                    console.log(`Distance: ${distance}, Travel Distance: ${location.travel_distance}`);
                    if (distance <= location.travel_distance) {
                        filteredProviders.push(provider);
                        break;
                    }
                }
            }
        }

        // Remove duplicate providers based on their IDs
        const uniqueProviders = Array.from(new Set(filteredProviders.map(provider => provider.id))).map(id => {
            return filteredProviders.find(provider => provider.id === id);
        });
        console.log(uniqueProviders);
        return res.json(uniqueProviders);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.toString() });
    }
});

// Refactored code from Chelsea

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

export default router;