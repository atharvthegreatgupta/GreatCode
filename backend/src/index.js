const express = require('express');
const app = express();
// require('dotenv').config({ path: '../.env' });
require('dotenv').config();
const main = require('./config/db.js');
const cookieParser = require('cookie-parser');

const authRouter = require('./routes/userAuth.js');
const redisClient = require('./config/redis.js');

const problemRouter = require('./routes/problemCreator.js');

const {submitRouter} = require("./routes/submit.js");

const aiRouter = require("./routes/aiChatting.js");

const videoRouter = require("./routes/videoCreator");

const cors = require('cors');

app.use(cors({
    origin: process.env.CLIENT_URL,
    credentials: true
}))

app.use( express.json() ); // converts json to java script object
app.use( cookieParser() ); // converts json to java script object



app.use('/user',authRouter);
app.use('/problem',problemRouter);
app.use('/submission',submitRouter);
app.use('/ai',aiRouter);
app.use("/video",videoRouter);

app.get("/", (req, res) => {
    res.send("Atharv is awesome");
});

redisClient.on('error', (err) => console.log('Redis Client Error', err));

const InitializeConnection = async () => {
    try {
        const port = process.env.PORT || 10000;
        app.listen(port, "0.0.0.0", () => {
            console.log("Server listening at " + port);
        });

        await main();
        await redisClient.connect();
        console.log("Databases Connected Successfully");

    } catch(err) {
        console.log("DB Connection Error: " + err.message);
    }
}

InitializeConnection();