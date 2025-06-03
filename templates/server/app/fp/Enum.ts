
function test() {
    const Enum = Object.freeze

    const Cities = Enum({
        Kiev: 1,
        Viev: 2,
    })

    Cities.Kiev = 2;

    console.log(Cities.Kiev)
}


test()