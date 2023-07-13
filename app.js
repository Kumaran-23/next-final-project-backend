import express from "express"
import cors from "cors"
import userRouter from "./src/controllers/users.controllers.js"
import authRouter from "./src/controllers/auth.controllers.js"
import providerRouter from "./src/controllers/provider.controllers.js"
import profileRouter from "./src/controllers/profile.controllers.js"
import availabilityRouter from "./src/controllers/availability.controllers.js"
import locationRouter from "./src/controllers/location.controllers.js"

const app = express()
app.use(express.json())
app.use(cors())

app.use('/users', userRouter);
app.use('/auth', authRouter);
app.use('/provider', providerRouter);
app.use('/profile', profileRouter);
app.use('/availability', availabilityRouter);
app.use('/location', locationRouter);

export default app