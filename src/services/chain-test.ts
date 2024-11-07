import { executeHttpRequest } from "./http-executor";
import { validateAssert } from "./assert-validation";
import { extractorVariable } from "./variable-extractor";
import { executeChildsWithLogic } from "./logic-child-executions";
import { executeQmassaStep } from "./qmassa";
import { ChaingunDataController, ChaingunTestStep } from "../types";

export const chainTest = async (chaingunDataController: ChaingunDataController, step: ChaingunTestStep, environments: Record<string, any>) => {
  if (!step.active) return
  switch (step.action) {
    case 'Http.get':
    case 'Http.post':
    case 'Http.put':
    case 'Http.patch':
    case 'Http.delete':
      await executeHttpRequest(chaingunDataController, step, environments)
      break;
    case 'Assert.different':
    case 'Assert.equals':
    case 'Assert.exists':
    case 'Assert.greater_equal':
    case 'Assert.in':
    case 'Assert.smaller_equal':
    case 'Assert.type':
    case 'Json.validate':
      await validateAssert(chaingunDataController, step, environments)
      break;
    case 'Set.variable':
    case 'SetDp.variable':
    case 'Faker.generate':
      await extractorVariable(chaingunDataController, step, environments)
      break;
    case 'Logic.if':
    case 'Loop.forOf':
      await executeChildsWithLogic(chaingunDataController, step, environments)
      break;
    case 'Qmassa.service':
    case 'Qmassa.sql':
      await executeQmassaStep(chaingunDataController, step, environments)
      break;
    default:
      break;
  }
}