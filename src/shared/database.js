const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/strada?replicaSet=rs0';

await mongoose.connect(uri);