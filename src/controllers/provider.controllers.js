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
      email: data.email
    }
  })

  if (!provider) return res.status(401).send({
    error: 'Email address or password not valid'
  })

  const checkPassword = bcrypt.compareSync(data.password, provider.password)
  if (!checkPassword) return res.status(401).send({
    error: 'Email address or password not valid'
  })

  const accessToken = await signAccessToken(provider)
  const providerId = provider.id
  return res.json({ accessToken, providerId })
})

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

// router.post('/search', async (req, res) => {
//     try {
//         const userAddress = req.body.userAddress;
//         const startTime = req.body.start_time;
//         const endTime = req.body.end_time;
//         const day = req.body.day;

//         console.log(`User Address: ${userAddress}`);
//         console.log(`Day: ${day}`);
//         console.log(`Start Time: ${startTime}`);
//         console.log(`End Time: ${endTime}`);
        
//         console.log(JSON.stringify({
//   where: {
//     provider_location: {
//       some: {
//         address: {
//           contains: userAddress,
//         },
//       },
//     },
//     provider_avalibility: {
//       some: {
//         AND: [
//           {
//             day: {
//               equals: day,
//             },
//           },
//           {
//             start_at: {
//               lte: startTime,
//             },
//           },
//           {
//             end_at: {
//               gte: endTime,
//             },
//           },
//         ],
//       },
//     },
//   },
// }, null, 2));



//         const providers = await prisma.provider.findMany({
//             where: {
//                 provider_location: {
//                     some: {
//                         address: {
//                             contains: userAddress
//                         }
//                     }
//                 },
//                 provider_avalibility: {
//                     some: {
//                         AND: [
//                             {
//                                 day: {
//                                     equals: day
//                                 }
//                             },
//                             {
//                                 start_at: {
//                                     lte: startTime
//                                 }
//                             },
//                             {
//                                 end_at: {
//                                     gte: endTime
//                                 }
//                             }
//                         ]
//                     }
//                 }
//             },
//             include: {
//                 provider_location: true,
//                 provider_avalibility: true
//             }
//         });

//         // Filter the providers based on their travel distance
//         const filteredProviders = [];
//         for (const provider of providers) {
//             for (const location of provider.provider_location) {
//                 console.log(`Calculating distance between ${userAddress} and ${location.address}`);
//                 const distance = await calculateDistance(userAddress, location.address);
//                 console.log(`Distance: ${distance}, Travel Distance: ${location.travel_distance}`);
//                 if (distance <= location.travel_distance) {
//                     filteredProviders.push(provider);
//                     break;
//                 }
//             }
//         }
//         console.log(filteredProviders);
//        return res.json(filteredProviders);
//     } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: error.toString() });
// }
// });

// router.post('/search', async (req, res) => {
//     try {
//         const userAddress = req.body.userAddress;
//         const startTime = req.body.start_time;
//         const endTime = req.body.end_time;
//         const day = req.body.day;

//         console.log(`User Address: ${userAddress}`);
//         console.log(`Day: ${day}`);
//         console.log(`Start Time: ${startTime}`);
//         console.log(`End Time: ${endTime}`);
        
//         // Get all providers with their locations and availabilities
//         const providers = await prisma.provider.findMany({
//             include: {
//                 provider_location: true,
//                 provider_avalibility: true
//             }
//         });

//         // Filter the providers based on their travel distance, day and time availability
//         const filteredProviders = [];
//         for (const provider of providers) {
//             let isProviderAvailable = provider.provider_avalibility.some(avail => {
//                 return avail.day === day 
//                     && avail.start_at >= startTime 
//                     && avail.end_at <= endTime
//             });

//             if(isProviderAvailable){
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
//         console.log(filteredProviders);
//         return res.json(filteredProviders);
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ error: error.toString() });
//     }
// });

// router.post('/search', async (req, res) => {
//     try {
//         const userAddress = req.body.userAddress;
//         const startTimeStr = convertTo24Hour(req.body.start_time);
//         const endTimeStr = convertTo24Hour(req.body.end_time);
//         const day = req.body.day;

//         // Convert time strings to Date objects for correct comparison
//         const startTime = new Date(`1970-01-01T${startTimeStr}:00Z`);
//         const endTime = new Date(`1970-01-01T${endTimeStr}:00Z`);

//         if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
//             throw new Error("Invalid start or end time");
//         }

//         // Get all providers with their locations and availabilities
//         const providers = await prisma.provider.findMany({
//             include: {
//                 provider_location: true,
//                 provider_avalibility: true
//             }
//         });

//         // Filter the providers based on their travel distance, day and time availability
//         const filteredProviders = [];
//         for (const provider of providers) {
//             let isProviderAvailable = provider.provider_avalibility.some(avail => {
//                 const providerStartTime = new Date(`1970-01-01T${avail.start_at}:00Z`);
//                 const providerEndTime = new Date(`1970-01-01T${avail.end_at}:00Z`);

//                 if (isNaN(providerStartTime.getTime()) || isNaN(providerEndTime.getTime())) {
//                     console.error(`Invalid provider time: ${avail.start_at} - ${avail.end_at}`);
//                     return false;
//                 }

//                 const isAvailable = avail.day === day 
//                     && providerStartTime <= startTime 
//                     && providerEndTime >= endTime;
                
//                 // Convert the times back to strings after comparison
//                 avail.start_at = providerStartTime.toISOString().substr(11, 5);
//                 avail.end_at = providerEndTime.toISOString().substr(11, 5);

//                 return isAvailable;
//             });

//             if(isProviderAvailable){
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

//         console.log(`User Address: ${userAddress}`);
//         console.log(`Day: ${day}`);
//         console.log(`Start Time: ${startTime.toISOString().substr(11, 5)}`);
//         console.log(`End Time: ${endTime.toISOString().substr(11, 5)}`);
        
//         return res.json(filteredProviders);
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ error: error.toString() });
//     }
// });

// router.post('/search', async (req, res) => {
//     try {
//         const userAddress = req.body.userAddress;
//         const day = req.body.day;

//         console.log(`User Address: ${userAddress}`);
//         console.log(`Day: ${day}`);
        
//         let startTime, endTime;
//         try {
//             startTime = new Date(`01/01/2007 ${convertTo24Hour(req.body.start_time)}`);
//             endTime = new Date(`01/01/2007 ${convertTo24Hour(req.body.end_time)}`);
//         } catch (error) {
//             return res.status(400).json({ error: "Invalid start_time or end_time format. Expected format is 'HH:MM am/pm'." });
//         }

//         console.log(`Start Time: ${startTime}`);
//         console.log(`End Time: ${endTime}`);
        
//         // Get all providers with their locations and availabilities
//         const providers = await prisma.provider.findMany({
//             include: {
//                 provider_location: true,
//                 provider_avalibility: true
//             }
//         });

//         // Filter the providers based on their travel distance, day and time availability
//         const filteredProviders = [];
//         for (const provider of providers) {
//             let isProviderAvailable = provider.provider_avalibility.some(avail => {
//                 const availStart = new Date(`01/01/2007 ${convertTo24Hour(avail.start_at)}`);
//                 const availEnd = new Date(`01/01/2007 ${convertTo24Hour(avail.end_at)}`);
//                 return avail.day === day 
//                     && availStart <= startTime 
//                     && availEnd >= endTime
//             });

//             if(isProviderAvailable){
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
//         console.log(filteredProviders);
//         return res.json(filteredProviders);
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ error: error.toString() });
//     }
// });

// router.post('/search', async (req, res) => {
//     try {
//         const userAddress = req.body.userAddress;
//         const startTime = req.body.start_time;
//         const endTime = req.body.end_time;
//         const day = req.body.day;

//         console.log(`User Address: ${userAddress}`);
//         console.log(`Day: ${day}`);
//         console.log(`Start Time: ${startTime}`);
//         console.log(`End Time: ${endTime}`);

//         const requestedStartTime = new Date("1970-01-01T" + convertTo24Hour(startTime) + "Z");
//         const requestedEndTime = new Date("1970-01-01T" + convertTo24Hour(endTime) + "Z");

//         // Get all providers with their locations and availabilities
//         const providers = await prisma.provider.findMany({
//             include: {
//                 provider_location: true,
//                 provider_avalibility: true
//             }
//         });

//         // Filter the providers based on their travel distance, day and time availability
//         const filteredProviders = [];
//         for (const provider of providers) {
//             let isProviderAvailable = provider.provider_avalibility.some(avail => {
//                 let providerStartTime = new Date("1970-01-01T" + convertTo24Hour(avail.start_at) + "Z");
//                 let providerEndTime = new Date("1970-01-01T" + convertTo24Hour(avail.end_at) + "Z");

//                 if(requestedStartTime >= providerStartTime && requestedEndTime <= providerEndTime){
//                     let startTimeString = requestedStartTime.toISOString().split('T')[1].slice(0, 5);
//                     let endTimeString = requestedEndTime.toISOString().split('T')[1].slice(0, 5);
//                     avail.start_at = convertTo12Hour(startTimeString);
//                     avail.end_at = convertTo12Hour(endTimeString);
//                     return true;
//                 }
//                 return false;
//             });

//             if(isProviderAvailable){
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
//         console.log(filteredProviders);
//         return res.json(filteredProviders);
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ error: error.toString() });
//     }
// });

router.post('/search', async (req, res) => {
    try {
        const userAddress = req.body.userAddress;
        const startTime = req.body.start_time;
        const endTime = req.body.end_time;
        const day = req.body.day;

        console.log(1)
        console.log(`User Address: ${userAddress}`);
        console.log(`Day: ${day}`);
        console.log(`Start Time: ${startTime}`);
        console.log(`End Time: ${endTime}`);

        const modifiedStartTime = startTime.replace(/([ap])m$/, ' $1m');
        const modifiedEndTime = endTime.replace(/([ap])m$/, ' $1m');

        const requestedStartTime = new Date("1970-01-01T" + convertTo24Hour(modifiedStartTime) + "Z");
        const requestedEndTime = new Date("1970-01-01T" + convertTo24Hour(modifiedEndTime) + "Z");

        // Get all providers with their locations and availabilities
        const providers = await prisma.provider.findMany({
            include: {
                provider_location: true,
                provider_avalibility: true
            }
        });

        // Filter the providers based on their travel distance, day and time availability
        const filteredProviders = [];
        for (const provider of providers) {
            let isProviderAvailable = provider.provider_avalibility.some(avail => {
                let providerStartTime = new Date("1970-01-01T" + convertTo24Hour(avail.start_at.replace(/([ap])m$/, ' $1m')) + "Z");
                let providerEndTime = new Date("1970-01-01T" + convertTo24Hour(avail.end_at.replace(/([ap])m$/, ' $1m')) + "Z");

                if(requestedStartTime >= providerStartTime && requestedEndTime <= providerEndTime){
                    let startTimeString = requestedStartTime.toISOString().split('T')[1].slice(0, 5);
                    let endTimeString = requestedEndTime.toISOString().split('T')[1].slice(0, 5);
                    avail.start_at = convertTo12Hour(startTimeString);
                    avail.end_at = convertTo12Hour(endTimeString);
                    return true;
                }
                return false;
            });

            if(isProviderAvailable){
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
        console.log(2)
        console.log(filteredProviders);
        return res.json(filteredProviders);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.toString() });
    }
});

export default router;
