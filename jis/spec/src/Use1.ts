import {Schema} from "./Types.ts"
import {Struct} from "./dataTypes/Struct.ts";
//import {correctData, CorrectParentData, IncorrectParentData} from "./InputData.js";
import {Func} from "./dataTypes/Func.ts";

const EventStruct = Struct({
    name: Schema.string(),
    active: Schema.bool(),
    id: Schema.integer(),
}, 'EventStruct');


const ISaver = Func(EventStruct)

const SaveToMysql = ISaver((event: any) => {
    console.log("Save to MYSQL = ", JSON.stringify(event))
});

const SaveToMongo = ISaver((event: any) => {
    console.log("Save to Mongo = ", JSON.stringify(event))
});

const correctData = {
    name: "test",
    active: true,
    id: "test"
}

const incorrectData = {
    name: "test",
    active: 122,
}

const event = EventStruct(incorrectData)

console.log('event result=', event);

// SaveToMysql(event);
// SaveToMongo(event);

// const [errIncorrect, eventIncorrect] = EventStruct(incorrectData)
//
// console.log("ERROR SECOND=", errIncorrect)
// SaveToMysql(eventIncorrect);
// SaveToMongo(eventIncorrect);
