const express = require('express')
const cookieParser = require('cookie-parser')
const cors = require('cors');
require("dotenv").config();

const app = express()

const corsOptions = {
   origin: 'http://localhost:3000',
   methods: ['GET', 'POST', 'DELETE', 'PUT', 'OPTIONS'],
   allowedHeaders: ['Content-Type', 'Authorization'],
   credentials: true,
};

app.use(cors(corsOptions));

app.use(express.json())
app.use(cookieParser())

app.use('/auth', require('./routes/auth/auth.route'))
// app.use(verifyJWT)
app.use('/', require('./routes'))

const PORT = process.env.PORT || 5000;

app.listen(PORT, async ()=>{
   console.log(`Server is running on port ${PORT}`);
})
