import type {IContainer} from "../types/container.ts";

const containerStorage = new Map()

export class Container implements IContainer {
    singleton(abstract: string, concrete: any): boolean {
        if (containerStorage.has(concrete)) {
            throw new Error("Singleton can be binding only once")
        }

        containerStorage.set(abstract, concrete)
        return true;
    }

    resolve(abstract = "") {
        return containerStorage.get(abstract);
    }

    loadServices(providers:(() => void)[]): void {
        for (const provider of providers) {
            provider()
        }
    }
}
