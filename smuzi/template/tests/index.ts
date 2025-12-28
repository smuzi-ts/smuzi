import { TestRunner } from "@smuzi/tests";
import {main} from "@smuzi/std";
export const testRunner = new TestRunner();

main(async () => {

    await testRunner.run();
})
