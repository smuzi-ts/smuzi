import {Schema as S} from "./Types.ts"
import {Struct} from "./dataTypes/Struct.ts";
import {correctData} from "./InputData.js";
import {Func} from "./dataTypes/Func.ts";

function customMessageString(realType, expectedType) {
    return `R=${realType}|E=${expectedType}`
}


const EventStruct = Struct({
    s: S.String(customMessageString),
    b: S.Boolean(customMessageString),
});

const CEventStruct = Struct({
    s: S.String(customMessageString),
    b: S.Boolean(customMessageString),
});


const [err, event] = EventStruct(correctData)
const [err2, event2] = EventStruct(correctData)

console.log('CHECK', event === event2)

const BSaver = Func(EventStruct);

const ConcreteSaver1 = BSaver((eventD) => {
    console.log("ConcreteSaver1", JSON.stringify(eventD))
});

ConcreteSaver1(event)