import { addStepId } from "./services/add-step-id";
import { chainTest } from "./services/chain-test";
import { ChaingunDataController, ChaingunTestStep } from "./types";
import { cloneObject } from "./utils/clone-object";
import { uuidV7 } from "./utils/uuid";



export async function chaingun(testSteps: ChaingunTestStep[], environments: Record<string, any> = {}){
  const start = Date.now()
  
  const envs = cloneObject(environments)

const  chaingunDataController: ChaingunDataController = {
    chaingunId : uuidV7().concat('-chaingun'),
    cookies:{},
    results:{}
  }

  const steps = cloneObject(testSteps)

  addStepId(steps)

  for (const step of steps) {
    if(step.action === 'Load.http'){
      // TODO load test
    }else {
      await chainTest(chaingunDataController, step, envs)
    }
  }

  const end = Date.now()
  const duration = end - start
 return {environments, duration}
}