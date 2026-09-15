import express from 'express';
import dotenv from 'dotenv'
import connectDB from './config/db.js'

dotenv.config();

const PORT = process.env.PORT || 3000;
const app = express();
app.use(express.json())

const startServer = async () => {
    try {
        app.get("/api/health", (req, res) => {
          res.send("I am making Explore Ilam Website");
        });

        await connectDB();

        app.listen(PORT, () => {
          console.log(`App is running on the port: ${PORT}`);
        });
    } catch (err) {
        console.log(`Server Failed: ${err.message}`);
    }
}

startServer();


