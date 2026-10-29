import express  from 'express';
import { container } from '../../../bootstrap/container.js'
export default class AuthRoutes {
  constructor() {
    this.router = express.Router();
    this.authController = container.resolve('AuthController');
    this.initRoutes();
  }

  initRoutes() {
this.router.post('/login', (req, res, next) => this.authController.login(req, res, next));  }
  getRouter() {
    return this.router;
  }
}

