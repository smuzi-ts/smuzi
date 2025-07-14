const p1 = () =>
    new Promise((resolve) => {
        setTimeout(() => {
            console.log('resolve p1')
            resolve(1);
        }, 1000)
    })

const p2 =  () => new Promise((resolve) => {
    setTimeout(() => {
        console.log('resolve p2')
        resolve(1);
    }, 2000)
})

const p3 = () => new Promise((resolve) => {
    setTimeout(() => {
        console.log('resolve p3')
        resolve(1);
    }, 1000)
})

const p4 = () => new Promise((resolve) => {
    setTimeout(() => {
        console.log('resolve p4')
        resolve(1);
    }, 3000)
})

const c1 = () => {
    return p1().then(() => p2());
}

const c2 = () => {
    return p3().then(() => p4());
}

const combo1 =  Promise.all([c1(), c2()]).then(() => {console.log('combo1')})