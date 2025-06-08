import {Schema as S} from "./Types.ts"
import {Struct} from "./dataTypes/Struct.ts";
import {inputData} from "./InputData.js";

function customMessageString(realType, expectedType) {
    return `R=${realType}|E=${expectedType}`
}

const EventStruct = Struct({
    s: S.String(customMessageString),
    b: S.Boolean(customMessageString),
});


const [err, event] = EventStruct(inputData)


const save = (eventD) => {
    console.log("event", err)
}

save(  {
})