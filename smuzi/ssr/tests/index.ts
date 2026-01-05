import { TestRunner } from "@smuzi/tests";
import {mainAndExit} from "@smuzi/std";
export const testRunner = new TestRunner();

mainAndExit(async () => {

    await testRunner.run();
})
