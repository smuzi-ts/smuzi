const SimulatorAPi = {
    getCredentialsById: async (id) => {
        return {
            json: async () => ({
                access_token: "access_token"
            })
        }
    },
    fetchCalendars: async (credentials) => {

        return {
            json: async () => ([
                {
                    id: 1,
                    name: 'First'
                },
                {
                    id: 2,
                    name: 'Second'
                }
            ])
        }
    },

    insert: async (row) => {
    }
}

const Result = {
    Ok: value => ({
        isOk: true,
        isFail: false,
        get: () => value,
    }),
    Err: error => ({
        isOk: false,
        isFail: true,
        get: () => error,
    })
};


const EitherAsync = (currentFn) => ({
    map: (nextFunc) =>
        EitherAsync(async () => {
            const res = await currentFn();
            return res.isOk ? Result.Ok(nextFunc(res.get())) : res;
        }),

    flatMap: (nextFunc) =>
        EitherAsync(async () => {
            const res = await currentFn();
            return res.isOk ? await nextFunc(res.get()).run() : res;
        }),

    run: () => currentFn(),
});


const getCredentialsById = (id) => EitherAsync(async() => {
    console.log('getCredentialsById Run id=' + id)

    return SimulatorAPi.getCredentialsById(id)
        .then(response => response.json())
        .then(data => Result.Ok(data))
        .catch(error => Result.Err(`DB error: ${error.message}`));
});

const fetchCalendars = (credentials) => EitherAsync(async() => {
    console.log('fetchCalendars Run credentials=', credentials)

    return Result.Err("fetchCalendars ERROR")

    return SimulatorAPi.fetchCalendars(credentials)
        .then(response => response.json())
        .then(data => Result.Ok(data))
        .catch(error => Result.Err(`API error: ${error.message}`))
});

const insertCalendar = (row) => EitherAsync(async() => {
    console.log('insertCalendar Run row=', row)

    return SimulatorAPi.insert(insertCalendar)
        .then(() => Result.Ok('Inserted'))
        .catch(error => Result.Err(`Insert error: ${error.message}`))
});


// Пример обработки цепочки
const program = getCredentialsById(2)
    .flatMap(fetchCalendars)
    .flatMap(insertCalendar);

program.run()

//
// program.run().then(result => {
//     console.log("Result=", result.get())
// });