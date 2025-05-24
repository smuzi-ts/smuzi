export interface IContainer {
    loadServices(providers: []): void
    bindOnce(abstract: string, concrete: any): void
    resolve(abstract: string): any
}

const container: IContainer