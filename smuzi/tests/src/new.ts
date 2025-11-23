import { Ok, Pipe, Result } from "@smuzi/std"

type  TestResults = Result<string, string>[];

    async function setupTests<Setup>(fn: () => Promise<Result<Setup, string>>) {
        return await fn();
    }

    async function deacribe<Setup>(setup: Setup): Promise<Result<Setup, string>> {
        return (msg, tests: () => ) => {

        }
    }


type MysSetup = {dbClient: string};


const setup = await setupTests(async () => {
    return Ok({dbClient: "MySQL"})
});

const 

