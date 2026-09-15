import express from 'express';
import dotenv from 'dotenv'

dotenv.config();

const PORT = process.env.PORT || 3000;
const app = express();
app.use(express.json())

app.get("/api/health", (req, res) => {
    res.send('I am making Explore Ilam Website');
});

app.listen(PORT, () => {
    console.log(`App is running on the port: ${PORT}`)
})


