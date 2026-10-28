import {createContainer, InjectionMode} from 'awilix'
import injectable from "./register-modules.js"

export const container = createContainer({
    injectionMode: InjectionMode.PROXY ,
});

export function setup(){
    container.register(injectable)
    console.log("files has been injected...")
}

