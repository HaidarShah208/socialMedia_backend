import mongoose from "mongoose";

export const connectDB = async (uri) => {
    try {
        await mongoose.connect(uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log(`Connected to MongoDB`);
    } catch (err) {
        console.error(`Error connecting to DB: ${err.message}`);
        process.exit(1); 
    }
};
