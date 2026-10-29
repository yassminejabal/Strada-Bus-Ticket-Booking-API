// IMPORT CLASS THAT U WANT
import {asClass, asValue, asFunction} from 'awilix'
import CoachController from '../modules/catalogue/controllers/coach.controller.js'
import coachService from '../modules/catalogue/services/coach.service.js'
import coachRepository from '../modules/catalogue/repositories/coach.reqository.js'
import CoachModel from '../modules/catalogue/models/coach.model.js'

// ADD TO THIS OBJECT CLASS THAT U WANT TO BE INJECTABLE
const  injectable = {
    CoachController: asClass(CoachController),
    CoachService: asClass(coachService),
    CoachRepository: asClass(coachRepository),
    CoachModel: asValue(CoachModel),

}

export default injectable