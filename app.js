import express from "express"
import cors from "cors"
import userRouter from "./src/controllers/users.controllers.js"
import authRouter from "./src/controllers/auth.controllers.js"
import providerRouter from "./src/controllers/provider.controllers.js"
import availabilityRouter from "./src/controllers/availability.controllers.js"

const app = express()
app.use(express.json())
app.use(cors())

app.use('/users', userRouter);
app.use('/auth', authRouter);
app.use('/providers', providerRouter);
app.use('/availability', availabilityRouter);

export default app