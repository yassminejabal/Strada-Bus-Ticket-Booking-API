import express from 'express';
import { container, setup } from './bootstrap/container.js';
import reservationsRoutes from './modules/reservations/routes/reservations.routes.js';
import authRoutes from './modules/identity/routes/auth.routes.js'
import errorHandler from './shared/error-handler.js'; 

setup();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.status(200).json({ message: 'Strada API is running' });
});

// Monter les modules
const authRoutesInstance = new authRoutes();
app.use('/api/v1/auth', authRoutesInstance.getRouter());
app.use('/api/v1', reservationsRoutes(container));

// Gestionnaire d'erreurs 
app.use(errorHandler); 

export default app;