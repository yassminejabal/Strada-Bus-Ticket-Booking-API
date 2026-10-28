import app from './app.js'
import dotenv from 'dotenv'
dotenv.config()

const PORT = process.env.PORT
console.log(PORT)


function startServer(app){
    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });
}

startServer(app)