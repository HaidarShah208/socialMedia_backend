import mongoose from "mongoose";


export const connectDB=(uri)=>{
    mongoose.connect(uri)
    .then((c)=>{
        console.log(`connected with mongodb`)
    }).catch((err)=>{
        console.error(`Error connecting to db: ${err.message}`)
    })

}