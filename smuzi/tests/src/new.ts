import { Ok, Pipe, Result } from "@smuzi/std"

type TestResults = Result<string, string>[];
type TestCase<Setup extends unknown> = (setup: Setup) => Promise<void>


const describe = <Setup>(msg: string, cases: TestCase<Setup>[]) => async (setup: Setup): Promise<void> => {
    for (const caseTest of cases) {
        await caseTest(setup);
    }
}

const it = <Setup>(msg: string, fn: TestCase<Setup>) => async (setup: Setup): Promise<void> => {
    await fn(setup);
}


type MysSetup = { dbClient: string };

async function pipeline<Setup>(
    groups: TestCase<Setup>[]
) {
    return async (setup: Setup) => {
        for (const group of groups) {
            await group(setup);
        }
    }

}

const mySetup = { dbClient: "Postgres" };

const pipelineUser = pipeline<MysSetup>(
    [
        describe("users - ", [
            it("get user", async () => {

            })
        ])
    ]
)

const pipelines = [
    pipelineUser
];

