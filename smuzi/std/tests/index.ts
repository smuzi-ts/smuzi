import { loadDescribesFromDir, pipelineTest } from "@smuzi/tests";

pipelineTest({
    descibes: await loadDescribesFromDir('./tests')
})