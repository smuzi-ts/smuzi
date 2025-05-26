export interface IContainer {
    loadServices(providers:(() => void)[]): void
    singleton(abstract: string, concrete: any): boolean
    resolve(abstract: string): any
}