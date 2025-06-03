import {T} from "./Types.js"
import {Struct} from "./Struct.ts";
import {inputData} from "./InputData.js";

const EventStruct = Struct({
    name: T.String(),
    marsha: T.Boolean(),
});


const [err, event] = EventStruct(inputData)

console.log("err", err)
console.log("event", event)

const save = (eventD) => {
    console.log("event", eventD.marsha)
}