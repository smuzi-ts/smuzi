export const correctData = {
    name: "test",
    active: true,
}

export const CorrectParentData = {
    name: "Parent",
    active: false,
    parentEvent: {
        name: "Child",
        active: true,
    }
}


export const IncorrectParentData = {
    name: "test",
    active: false,
    parentEvent: {
        name: true,
        active: true,
    }
}