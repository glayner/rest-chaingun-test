import { ChaingunDataController, ChaingunTestStep } from "../types";

export const executeQmassaStep = async (
  chaingunDataController: ChaingunDataController,
  step: ChaingunTestStep,
  environment: Record<string, any>): Promise<{ chaingunDataController: ChaingunDataController, environment: Record<string, any> }> => {

  return { environment, chaingunDataController }
}