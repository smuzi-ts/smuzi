import {Schema, type, validation} from "./types.ts"



const EventStruct = Struct({
    name: type.String,
    active: type.Boolean,
});

const [err, event] = EventStruct({name: "t"})

event.name = "t";

console.log(event)

//
// const Func = Schema({name: type.String, active: type.Boolean})
//
// const save = Func((event: Event) => {
//     event.active = false;
//     console.log(`NAME=${event.name}|ACTIVE=${event.active}`)
// })
//
// save({name: 't', active: true})
