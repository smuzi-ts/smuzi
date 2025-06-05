import {Task} from './../Task.ts'

export default Task(import.meta.url, {
    method1: (p1, p2) => {
        console.log(p1, p2)
    }
})