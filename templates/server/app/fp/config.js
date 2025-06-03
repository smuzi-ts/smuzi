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
    Ok: data => ({
        isOk: true,
        value: data,
    }),
    Err: error => ({
        isOk: false,
        value: error,
    })
};


const Maybe = (val) => ({
    val,
    map: function (f) {
        return this.isNothing() ? this : Maybe(f(val))
    },
    flatMap: function (f) {
        return this.isNothing() ? this.val : f(val)
    },
    isNothing: () => val === undefined || val === null,

})

const Task = effect => input => effect(input)

const AsyncTask = effect => input => effect(input)

const Flow = (result) => ({
    result,
    map: function(nextTask) {
        if (this.isFail()) {
            return this;
        }

        return Flow(nextTask(this.result.value))
    },
    flatMap: function(nextTask) {
        if (this.isFail()) {
            return this.result;
        }
        return nextTask(this.result.value)
    },

    flat: () => result,

    isFail() {
        return ! this.result.isOk
    }
})

const first = AsyncTask( (id) => {
    console.log('first=', id)
    return Promise.resolve(Result.Ok([1,2,3]))
})

const second = AsyncTask( (list) => {
    console.log('second=', list)
    return Promise.resolve(Result.Ok(list[2]))
})

const third = AsyncTask( (element) => {
    console.log('third=', element)
    return Promise.resolve(Result.Ok(element))
})

// const app = Flow(Result.Ok(1))
//     .map(first)
//     .map(second)
//     .map(third)
//     .flat()


const getCredentialsById = AsyncTask((id) => {
    console.log('getCredentialsById Run id=' + id)

    return SimulatorAPi.getCredentialsById(id)
        .then(response => response.json())
        .then(data => Result.Ok(data))
        .catch(error => Result.Err(`DB error: ${error.message}`));
});

const fetchCalendars = AsyncTask((credentials) => {
    console.log('fetchCalendars Run credentials=', credentials)

    return SimulatorAPi.fetchCalendars(credentials)
        .then(response => response.json())
        .then(data => Result.Ok(data))
        .catch(error => Result.Err(`API error: ${error.message}`))
});

const insertCalendar = AsyncTask ((row) => {
    console.log('insertCalendar Run row=', row)

    return SimulatorAPi.insert(insertCalendar)
        .then(() => Result.Ok('Inserted'))
        .catch(error => Result.Err(`Insert error: ${error.message}`))
});

const ResultID = Result.Ok(2);



const app = Flow(ResultID)
    .flatMap(getCredentialsById)
    .flatMap(fetchCalendars)
    .flatMap(insertCalendar)

console.log("app", app);

// const program = getCredentialsById(id)
//     .flatMap(result => result.isOk
//         ? fetchCalendars(result.value, 'calendarId')
//         : Task(() => result)
//     ).flatMap(result =>
//         result.isOk
//             ? insertCalendar(result.value)
//             : Task(() => result)
//     );

// program.run().then(result => {
//     if (result.isOk) {
//         console.log('✅ Success:', result.value);
//     } else {
//         console.error('❌ Error:', result.value);
//     }
// });