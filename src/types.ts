import { AxiosRequestConfig, AxiosResponseHeaders, RawAxiosResponseHeaders } from "axios";
import { ClientRequest, IncomingMessage } from "http";

type actionType =
  | "Set.variable"
  | "Assert.equals"
  | "Assert.different"
  | "Assert.exists"
  | "Assert.type"
  | "Assert.in"
  | "Json.validate"
  | "Assert.greater_equal"
  | "Assert.smaller_equal"
  | "Faker.generate"
  | "Http.get"
  | "Http.post"
  | "Http.patch"
  | "Http.put"
  | "Http.delete"
  | "Code.run"
  | "SetDp.variable"
  | "Qmassa.sql"
  | "Qmassa.service";

interface parameterSet {
  key: string;
  value: string;
}

interface parameterFaker {
  category: string;
  function: string;
  parameters: string[];
  variable: string;
}

interface parameterAssert {
  expression: string;
  value?: string | string[];
}
interface parameterJson {
  expression: string;
  schema: string;
}
interface parameterCode {
  code: string;
}

interface parameterHttp {
  url: string;
  params?: Record<string, string>;
  headers?: Record<string, string>;
  form?: Record<string, string | number | boolean>;
  payload?: string;
  bodyType?: "TEXT" | "JSON" | "FORM";
  variable: string;
  option?: {
    timeout?: number;
    sleepAfter?: number;
  }

}

interface parameterQmassaSql {
  sqlId: string;
}

interface parameterQmassaService {
  service: string;
  parameters: Record<string, any>;
}

type ParametersMap = {
  "Assert.equals": parameterAssert;
  "Assert.different": parameterAssert;
  "Assert.exists": parameterAssert;
  "Assert.type": parameterAssert;
  "Assert.in": parameterAssert;
  "Assert.greater_equal": parameterAssert;
  "Assert.smaller_equal": parameterAssert;
  "Set.variable": parameterSet;
  "Json.validate": parameterJson;
  "Faker.generate": parameterFaker;
  "Http.get": parameterHttp;
  "Http.post": parameterHttp;
  "Http.patch": parameterHttp;
  "Http.put": parameterHttp;
  "Http.delete": parameterHttp;
  "Code.run": parameterCode;
  "Qmassa.sql": parameterQmassaSql;
  "Qmassa.service": parameterQmassaService;
  "SetDp.variable": parameterSetDp;
};

type CodeTest<A extends actionType> = {
  _id?: string;
  action: A;
  active: boolean
  parameters: ParametersMap[A];
};

type codeTest = {
  [A in actionType]: CodeTest<A>;
}[actionType];

export interface loopForOfCodeTest {
  _id?: string;
  action: "Loop.forOf";
  active: boolean
  parameters:{
    expression: string;
    variable: string;
  }
  children: codeValue[];
}

export interface ifCodeTest {
  _id?: string;
  action: "Logic.if";
  active: boolean
  childrenIf: codeValue[];
  childrenElse?: codeValue[];
  parameters: {
    key: string;
    value: string;
    operator:  '==' | '!=' | '>' | '>=' | '<' | '<=';
    hasElse: boolean;
  };
}

interface loadCodeTest {
  _id?: string;
  action: "Load.http";
  active: boolean
  steps: {
    workers?: number;
    duration?: number;
    rampTo?: number;
    arrivalRate?: number;
    arrivalCount?: number;
    pause?: number;
  }[]
  children: codeValue[];
}

interface parameterSetDp {
  data: { key: string; value: string[] }[]
  processedData: { key: string; value: string[] }[]
}

export type codeValue = codeTest | loopForOfCodeTest | ifCodeTest;

export type ChaingunTestStep = codeValue | loadCodeTest
export type ChaingunActionTypes = actionType | "Load.http" | "Logic.if" | "Loop.forEach"

export interface Timings {
	start: number;
	socket?: number;
	lookup?: number;
	connect?: number;
	secureConnect?: number;
	upload?: number;
	response?: number;
	end?: number;
	error?: number;
	abort?: number;
	phases: {
		wait?: number;
		dns?: number;
		tcp?: number;
		tls?: number;
		request?: number;
		firstByte?: number;
		download?: number;
		total?: number;
	};
}

export interface ClientRequestWithTimings extends ClientRequest {
	timings?: Timings;
}

export interface IncomingMessageWithTimings extends IncomingMessage {
	timings?: Timings;
}

export type MyCookie = Record<string, Record<string, string>>;

export type HttpExecutorResult = {
  request: AxiosRequestConfig,
  response: {
    timings?: Timings;
    size?: number;
    headers?: Record<string,string> | AxiosResponseHeaders |  RawAxiosResponseHeaders ;
    status?: number;
    data?: any;
    isError: boolean
    errorMessage?: string;
  }
}

type ResultData = HttpExecutorResult | Record<string, ResultData[]>


export type ChaingunDataController = {
  chaingunId: string;
  cookies: MyCookie;
  results: Record<string, ResultData[]>
}