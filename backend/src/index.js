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

// app.use( cors({

//     origin : 'http://localhost:5173', // * for all the host to access
//     credentials : true
// }) )

// app.use(cors({
//     origin: 'https://my-coding-platform-bhtm.onrender.com',
//     credentials: true
// }))

app.use(cors({
    origin: [
        'http://localhost:5173',
        'https://my-coding-platform-bhtm.onrender.com'
    ],
    credentials: true
}));

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

const InitializeConnection = async ()=>{

    try{
        await Promise.all( [main(), redisClient.connect()] );
        console.log("DB Connected");

        app.listen( process.env.PORT, ()=>{

            console.log("server listening at " + process.env.PORT);
        })


    }
    catch(err){
        console.log("Error : " + err.message);
    }
}

InitializeConnection();


// main()
// .then( async ()=>{

//     app.listen( process.env.PORT, ()=>{

//         console.log("server listening at " + process.env.PORT);
//     })

// } )
