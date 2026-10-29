import reservationsRoutes from './routes/reservations.routes.js';
export default (container) => {
  return {
    routes: reservationsRoutes(container),
  };
};