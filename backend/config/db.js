import mongoose from 'mongoose'

const connectDB = async () => {
    try { 
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB connected: ${conn.connection.port} ${conn.connection.host}`);
    } catch (err) {
        console.log(`Error Occurred connecting DB: ${err.message}`);
    }
}

export default connectDB;