import { Router } from 'express';

export default class AuthRoutes {
  constructor({ authController }) {
    this.router = Router();
    this.authController = authController;
    this.initRoutes();
  }

  initRoutes() {
    this.router.post('/login', this.authController.login);
  }
  
  getRouter() {
    return this.router;
  }
}