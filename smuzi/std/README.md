[https://github.com/smuzi-ts/smuzi/tree/main/smuzi/std
](Github)

# @smuzi/std

A lightweight standard library for JavaScript and TypeScript.

Provides core functionality and utility methods for working with **Patterns Matching**, **Option**, **Result** , **Safe JSON**, **env**,  and many more.

---

## Installation

```bash
npm install @smuzi/std
```

---
> See more examples in the [tests folder](./tests).

## Patterns Matching
Pattern Matching has a very powerful mechanism for working with strings, numbers, regular expressions, functions, objects, arrays, and so on.
All of this is done using a single **match()** function.
```ts
let input = "users/3"
let patterns = new Map();

patterns.set("users", "users list");
patterns.set("users/archived", "list of archived users");
patterns.set(/^users\/\d+$/, "find"); //RegExp

let resultMatch = match(input, patterns, "not found")
```

## Result

```ts
type SomeErr = {msg: string};
function validation(input: number): Result<string, SomeErr> {
    return input > 100 ? Err({msg: "Too many characters"}) : Ok("Normal");
}
const res = validation(2).match({
    Ok: msg => msg,
    Err: err => err.msg,
});
```

## Option

```ts
function prepare(body: Option<string> = None()): string {
    return body.match({
        Some: bodyStr => bodyStr + "Some data",
        None: () => "Empty body"
    })
}

```

## Safe JSON parser

```ts
    type User = StdRecord<{
    id: number,
    name: string,
    post: StdRecord<{title: string}>
}>;

type UserData = StdRecord<{
    data: StdList<User>,
}>

const inputString = `{"data": [{"id":1,"name": "333", "post":{"title":"Subject"}}, {"id":2,"name": "2222", "post":{"title":"Subject2"}}]}`;

const resultJSON = json.fromString<UserData>(inputString)
    .unwrap() //Possible JSON parse error
    .unwrap() //Possible empty JSON;

const data = resultJSON
    .get("data")
    .unwrap(); //Possible empty data

const first = data.get(0).unwrap() //Possible first element is empty
const firstId = first.get("id").unwrap();
const firstTitle= first.get("post")
    .unwrap() //Possible post is empty
    .get("title")
    .unwrap(); //Possible title is empty

assert.equal(firstId, 1);
assert.equal(firstTitle, "Subject");
```

