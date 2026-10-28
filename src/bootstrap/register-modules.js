// IMPORT CLASS THAT U WANT
import {asClass, asValue, asFunction} from 'awilix'
import CoachController from '../modules/catalogue/controllers/coach.controller.js'


// ADD TO THIS OBJECT CLASS THAT U WANT TO BE INJECTABLE
const  injectable = {
    CoachController: asClass(CoachController),
}

export default injectable