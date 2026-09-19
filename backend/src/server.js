import "./config/env.js";
import connectDB from "./config/db.js";
import app from "./app.js"

const PORT = process.env.PORT || 3000;

const startServer = async () => {
    try {
        await connectDB();

        app.listen(PORT, () => {
          console.log(`App is running on the port: ${PORT}`);
        });
    } catch (err) {
        console.log(`Server Failed: ${err.message}`);
    }
}

startServer();


