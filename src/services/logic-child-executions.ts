import { ChaingunDataController, ChaingunTestStep, codeValue, ifCodeTest, loopForOfCodeTest, } from "../types";
import { replaceMarkers } from "../utils/variable-replacement";
import { chainTest } from "./chain-test";

export const executeChildsWithLogic = async (
  chaingunDataController: ChaingunDataController,
  step: ChaingunTestStep,
  environment: Record<string, any>): Promise<{ chaingunDataController: ChaingunDataController, environment: Record<string, any> }> => {
  if (step.action === 'Logic.if')
    await logicIfElseExecution(chaingunDataController, step, environment)
  else if (step.action === 'Loop.forOf')
    await loopForOfExecution(chaingunDataController, step, environment)

  return { environment, chaingunDataController }
}

const logicIfElseExecution = async (chaingunDataController: ChaingunDataController,
  step: ifCodeTest,
  environment: Record<string, any>) => {
  const key = replaceMarkers(step.parameters.key, environment)
  const value = replaceMarkers(step.parameters.value, environment)

  let validate = false;

  switch (step.parameters.operator) {
    case '==':
      validate = key == value;
      break;
    case '!=':
      validate = key != value;
      break;
    case '<':
      validate = key < value;
      break;
    case '<=':
      validate = key <= value;
      break;
    case '>':
      validate = key > value;
      break;
    case '>=':
      validate = key >= value;
      break;

    default:
      break;
  }

  if (validate && step.childrenIf.length) {
    await executeChilds(chaingunDataController, step._id as string, step.childrenIf, environment)
  } else if (!validate && step.parameters.hasElse && step.childrenElse?.length) {
    await executeChilds(chaingunDataController, step._id as string, step.childrenElse, environment)
  }

}

const loopForOfExecution = async (chaingunDataController: ChaingunDataController,
  step: loopForOfCodeTest,
  environment: Record<string, any>) => {
  const expression = replaceMarkers(step.parameters.expression, environment)
  const variable = step.parameters.variable


  if (expression && typeof expression === 'object') {
    let elementList = expression

    if (!Array.isArray(elementList)) {
      elementList = Object.values(expression)
    }

    for await (const element of expression) {
      environment[variable] = element
      await executeChilds(chaingunDataController, step._id as string, step.children, environment)
    }
  }

}


const executeChilds = async (chaingunDataController: ChaingunDataController,
  stepOriginId: string,
  childs: codeValue[],
  environment: Record<string, any>) => {
  for await (const step of childs) {
    const stepChildsDataController: ChaingunDataController = {
      chaingunId: chaingunDataController.chaingunId,
      cookies: chaingunDataController.cookies,
      results: {}
    }

    await chainTest(stepChildsDataController, step, environment)

    if (!chaingunDataController.results[stepOriginId]) chaingunDataController.results[stepOriginId] = []
    chaingunDataController.results[stepOriginId].push(stepChildsDataController.results)
  }
}