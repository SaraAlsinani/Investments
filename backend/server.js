import path from "path";
import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.routes.js";
import serviceRoutes from "./routes/service.routes.js";
import paymentRoutes from "./routes/pay.routes.js"
import connectToMongoDB from "./db/connectToMongoDB.js";

const app = express();

dotenv.config();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/service", serviceRoutes);
app.use('/api/payment', paymentRoutes);



app.listen(PORT, ()=>{

    connectToMongoDB();
    console.log(`server runing on port ${PORT}`)
} );