import {T} from "./Types.js"
import {Struct} from "./Struct.ts";

const EventStruct = Struct({
    name: T.String(),
    active: T.Boolean(),
});

let sourceData = {name: 1};

const [err, event] = EventStruct(sourceData)

console.log("err", err)
console.log("event", event)

//
// const Func = Schema({name: type.String, active: type.Boolean})
//
// const save = Func((event: Event) => {
//     event.active = false;
//     console.log(`NAME=${event.name}|ACTIVE=${event.active}`)
// })
//
// save({name: 't', active: true})
