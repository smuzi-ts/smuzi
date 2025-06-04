import {Schema} from "./Types.ts"
import {Struct} from "./Struct.ts";
import {inputData} from "./InputData.js";

function customMessageString(realType, expectedType) {
    return `R=${realType}|E=${expectedType}`
}

const EventStruct = Struct({
    name: Schema.String(customMessageString),
    marsha: Schema.Boolean(customMessageString),
});


const [_, event] = EventStruct(inputData)

const save = (eventD) => {
    console.log("event", eventD.marsha)
}