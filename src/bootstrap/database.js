import mongoose from 'mongoose';

export async function connectDB() {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/strada?replicaSet=rs0';

    await mongoose.connect(uri);

    console.log("Connecté avec succès à MongoDB (Replica Set: rs0)");
  } catch (error) {
    console.error(" Échec de la connexion à MongoDB :", error.message);
    process.exit(1);
  }
}