import express from "express"
import cors from "cors"
import userRouter from "./src/controllers/users.controllers.js"
import authRouter from "./src/controllers/auth.controllers.js"
import providerRouter from "./src/controllers/provider.controllers.js"
import availabilityRouter from "./src/controllers/availability.controllers.js"
import locationRouter from "./src/controllers/location.controllers.js"
import checkoutRouter from "./src/controllers/checkout.controller.js"
import bookingRouter from "./src/controllers/booking.controllers.js"
import imageRouter from "./src/controllers/image.controllers.js"
import dotenv from 'dotenv';

dotenv.config();

const app = express()
app.use(express.json())
app.use(cors())

app.use('/users', userRouter);
app.use('/auth', authRouter);
app.use('/providers', providerRouter);
app.use('/availability', availabilityRouter);
app.use('/location', locationRouter);
app.use('/create-checkout-session', checkoutRouter);
app.use('/booking', bookingRouter);
app.use('/provider-image', imageRouter);

export default app