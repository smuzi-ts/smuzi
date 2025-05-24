const containerStorage = new Map()

export const container = {
    bindOnce(abstract = "", concrete) {
        if (containerStorage.has(concrete)) {
            return;
        }
        containerStorage.set(abstract, concrete)
    },
    resolve(abstract = "") {
        return containerStorage.get(abstract);
    },
    loadServices(providers = []) {
        for (const provider of providers) {
            provider()
        }
    }
}
