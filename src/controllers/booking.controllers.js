import express from "express"
import prisma from "../utils/prisma.js"
import auth from "../middleware/auth.js";

const router = express.Router();

// router.post('/', auth, async (req, res) => {

//   console.log(req.body);  
//   try {
//     const newBooking = await prisma.booking.create({
//       data: {
//         user_id: req.body.userId,
//         provider_id: req.body.providerId,
//         address: req.body.userAddress,
//         service_fee: req.body.serviceFee,
//         booking_starttime: req.body.startTime,
//         booking_endtime: req.body.endTime,
//         booking_date: req.body.date
//       },
//     });
//     console.log('New Booking:', newBooking);
//     res.status(201).json(newBooking);
//   } catch (error) {
//     console.error('Error:', error);
//     res.status(500).json({ error: 'Unable to book service' });
//   }
// });

router.post('/', async (req, res) => {

    console.log(req.body);
  try {
    const newBooking = await prisma.booking.create({
      data: {
        address: req.body.address,
        service_fee: req.body.service_fee,
        booking_starttime: req.body.booking_starttime,
        booking_endtime: req.body.booking_endtime,
        booking_date: new Date(req.body.booking_date),
        user: {
          connect: {
            id: req.body.user_id
          }
        },
        provider: {
          connect: {
            id: req.body.provider_id
          }
        }
      },
    });
    console.log('New Booking:', newBooking);
    res.status(201).json(newBooking);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Unable to book service' });
  }
});


export default router