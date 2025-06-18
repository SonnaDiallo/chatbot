const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    console.log("Tentative de connexion à MongoDB...");
    console.log("URI: " + process.env.MONGODB_URI.replace(/:[^:]*@/, ":****@"));
    
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 20000, // <-- augmente le délai
      socketTimeoutMS: 45000,
      connectTimeoutMS: 30000
    });
        
    console.log(`MongoDB connecté: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`Erreur de connexion à MongoDB: ${error.message}`);
    console.error(error);
    process.exit(1);
  }
};

module.exports = connectDB;