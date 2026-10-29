// IMPORT CLASS THAT U WANT
import {asClass, asValue, asFunction} from 'awilix'
import CoachController from '../modules/catalogue/controllers/coach.controller.js'
import AuthController from '../modules/identity/controllers/auth.controller.js'
import AuthService from '../modules/identity/services/auth.service.js'
import userRepository from '../modules/identity/repositories/user.repository.js'
import UserModel from '../modules/identity/models/user.model.js'


// ADD TO THIS OBJECT CLASS THAT U WANT TO BE INJECTABLE
const  injectable = {
    CoachController: asClass(CoachController),
    AuthController: asClass(AuthController),
    AuthService: asClass(AuthService),
    userRepository: asClass(userRepository),
    UserModel: asValue(UserModel),
}

export default injectable