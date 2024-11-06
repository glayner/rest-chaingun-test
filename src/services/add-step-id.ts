import { ChaingunTestStep } from "../types";
import { uuidV7 } from "../utils/uuid";

export const addStepId = (steps: ChaingunTestStep[]) => {
  for (const step of steps) {
    if (!step._id) step._id = uuidV7()
    if(step.action === 'Load.http' || step.action === 'Loop.forEach'){
      addStepId(step.children)
    } else if(step.action === 'Logic.if'){      
      addStepId(step.childrenIf)
      addStepId(step.childrenElse || [])
    }
  }
}