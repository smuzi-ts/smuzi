import {Routine} from '../Routine.ts'

export default Routine(import.meta.url, {
    method1: async (p1, p2) => {
        throw new Error("!!!UPS!!!")
        return p1 + p2;
    }
})