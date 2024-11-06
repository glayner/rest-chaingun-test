import { executeHttpRequest } from "./http-executor";
import { ChaingunDataController, ChaingunTestStep } from "../types";

export const chainTest = async (chaingunDataController: ChaingunDataController, step: ChaingunTestStep, environments: Record<string, any> ) =>{
    switch (step.action) {
      case 'Http.get':
      case 'Http.post':
      case 'Http.put':
      case 'Http.patch':
      case 'Http.delete':
       await executeHttpRequest(chaingunDataController, step, environments)
        break;
    
      default:
        break;
    }
}