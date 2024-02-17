// app.js
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const userRoutes = require('./routes/userRoutes');
// const userRoutes = require('./routes')

const dotenv = require('dotenv')
 dotenv.config()

const app = express();
const port = 3000;


app.use(bodyParser.json());

const mongoo_url = `${process.env.MONGOOSE_URL}`
const connection_parameters = {
    useNewUrlParser: true, 
    useUnifiedTopology: true    
}

mongoose.connect(mongoo_url,connection_parameters)
    .then(() => {
        console.log('Connected to MongoDB');
   
    }) 
    .catch((error) => {
        console.error('Error connecting to MongoDB:', error);
    });

app.use('/users', userRoutes);  

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
}); 
