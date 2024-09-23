import { connectDB } from "./config/database.js";
import express from "express"
import dotenv from "dotenv";
import postRouter from './routes/postRoute.js'
import userRouter from './routes/userRoute.js'
import cookieParser from "cookie-parser";
import cors from 'cors'
dotenv.config({ path: "./.env" });

export const envMode = process.env.NODE_ENV?.trim() || "DEVELOPMENT";
const port = Number(process.env.PORT) || 3000;
const mongodbUrl = process.env.MONGODB_URI;

connectDB(mongodbUrl)
const app= express();

app.use(cors({
    origin:'http://localhost:3000',
    credentials:true,
}))
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cookieParser())

app.get('/', (req, res) =>{
    res.send('Hello, World!')
})

app.use('/api', postRouter);
app.use('/api', userRouter);
app.listen(port, () => {
    console.log(`Server running at port ${port}`);
  });