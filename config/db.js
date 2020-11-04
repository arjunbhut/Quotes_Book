const mongoose = require('mongoose');

const connection = async() => {
    try{
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useFindAndModify: false
        })
        console.log(`MongoDB Connected: ${conn.connection.host}`)
         
    }
    catch{
        console.error(err)
        process.exit(1)
    }
}

module.exports = connection;