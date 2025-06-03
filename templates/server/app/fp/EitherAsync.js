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



// Either — простая монада для успеха / ошибки
const Right = (value) => ({
    isRight: true,
    isLeft: false,
    map: (f) => Right(f(value)),
    flatMap: (f) => f(value),
    get: () => value,
});

const Left = (error) => ({
    isRight: false,
    isLeft: true,
    map: () => Left(error),
    flatMap: () => Left(error),
    get: () => { throw new Error("Can't get value from Left"); },
});

// EitherAsync — асинхронная монада с поддержкой ошибок
const EitherAsync = (asyncFn) => ({
    map: (f) =>
        EitherAsync(async () => {
            const res = await asyncFn();
            return res.isRight ? Right(f(res.get())) : res;
        }),

    flatMap: (f) =>
        EitherAsync(async () => {
            const res = await asyncFn();
            if (res.isLeft) return res;
            return await f(res.get()).run();
        }),

    run: () => asyncFn(),
});


const getCredentialsById = (id) => EitherAsync(async() => {
    console.log('getCredentialsById Run id=' + id)

    return SimulatorAPi.getCredentialsById(id)
        .then(response => response.json())
        .then(data => Right(data))
        .catch(error => Left(`DB error: ${error.message}`));
});

const fetchCalendars = (credentials) => EitherAsync(async() => {
    console.log('fetchCalendars Run credentials=', credentials)

    return SimulatorAPi.fetchCalendars(credentials)
        .then(response => response.json())
        .then(data => Right(data))
        .catch(error => Left(`API error: ${error.message}`))
});

const insertCalendar = (row) => EitherAsync(async() => {
    console.log('insertCalendar Run row=', row)

    return SimulatorAPi.insert(insertCalendar)
        .then(() => Right('Inserted'))
        .catch(error => Left(`Insert error: ${error.message}`))
});


// Пример обработки цепочки
const program = getCredentialsById(2)
    .flatMap(fetchCalendars)
    .flatMap(insertCalendar);



program.run().then(result => {
    if (result.isRight) {
        console.log('✅ Успех:', result.get());
    } else {
        console.log('❌ Ошибка:', result);
    }
});