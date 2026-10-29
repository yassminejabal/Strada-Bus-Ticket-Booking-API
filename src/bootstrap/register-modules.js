// IMPORT CLASS THAT U WANT
import {asClass, asValue, asFunction} from 'awilix'
import CoachController from '../modules/catalogue/controllers/coach.controller.js'
import coachService from '../modules/catalogue/services/coach.service.js'
import coachRepository from '../modules/catalogue/repositories/coach.reqository.js'
import CoachModel from '../modules/catalogue/models/coach.model.js'
import AuthController from '../modules/identity/controllers/auth.controller.js'
import AuthService from '../modules/identity/services/auth.service.js'
import userRepository from '../modules/identity/repositories/user.repository.js'
import UserModel from '../modules/identity/models/user.model.js'


// ADD TO THIS OBJECT CLASS THAT U WANT TO BE INJECTABLE
const  injectable = {
    CoachController: asClass(CoachController),
    CoachService: asClass(coachService),
    CoachRepository: asClass(coachRepository),
    CoachModel: asValue(CoachModel),

    AuthController: asClass(AuthController),
    AuthService: asClass(AuthService),
    userRepository: asClass(userRepository),
    UserModel: asValue(UserModel),
}

export default injectable