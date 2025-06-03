const Task = run => ({
    run,
    map: f => Task(() => run().then(f)),
    flatMap: f => Task(() => run().then(v => f(v).run()))
});
