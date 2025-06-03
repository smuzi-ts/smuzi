export interface IContainer {
    singleton(abstract: string, concrete: any): boolean
    bind(abstract: string, concrete: any): boolean
    resolve(abstract: string): any
}