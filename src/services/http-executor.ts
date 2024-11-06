
import axios, { AxiosError, AxiosRequestConfig, AxiosResponseHeaders } from 'axios';
import https from 'https';
import qs from 'qs';
import { ChaingunDataController, ChaingunTestStep, Timings } from "../types";
import { formatCookie, updateCookie } from '../utils/cookie';
import timer from '../utils/http-timer';
import { sleep } from "../utils/sleep";
import { replaceMarkers } from '../utils/variable-replacement';


export async function executeHttpRequest(chaingunDataController: ChaingunDataController, testStep: ChaingunTestStep, environment: Record<string, any>): Promise<any> {
  if (testStep.action !== 'Http.get' &&
    testStep.action !== 'Http.post' &&
    testStep.action !== 'Http.delete' &&
    testStep.action !== 'Http.put' &&
    testStep.action !== 'Http.patch' || !testStep.action) return;

  const transport = {
    request: function httpsWithTimer(...args: any[]) {
      const request = https.request.apply(null, args as any)
      timer(request)

      return request
    }
  }

  const { bodyType, variable, form = {}, option, payload } = testStep.parameters
  let { url, headers = {}, params = {} } = testStep.parameters

  const method = testStep.action.split('.')[1].toUpperCase()
  console.log({ url, environment })
  url = replaceMarkers(url, environment)

  console.log({ url })
  headers = replaceMarkers(headers, environment)
  params = replaceMarkers(params, environment)

  let body;

  if (method !== 'GET') {
    if (bodyType === 'TEXT') {
      headers['Content-Type'] ??= 'text/plain'
      body = replaceMarkers(payload, environment)
    } else if (bodyType === 'JSON') {
      headers['Content-Type'] ??= 'application/json'
      body = replaceMarkers(payload, environment)
    } else if (bodyType === 'FORM') {
      headers['Content-Type'] ??= 'application/x-www-form-urlencoded'
      body = qs.stringify(replaceMarkers(form, environment))
    }
  }

  const { cookies, results } = chaingunDataController
  const stepId = testStep._id as string

  if (!results[stepId]) {
    results[stepId] = []
  }

  headers['Cookie'] = formatCookie(cookies)


  const axiosConfig: AxiosRequestConfig = {
    method: testStep.action.split('.')[1].toUpperCase(),
    url,
    params,
    headers: {
      'User-Agent': 'tsa-chaingun',
      ...headers
    },
    transport,
  };
  
  if (body) axiosConfig.data = body

  if (option?.timeout) {
    axiosConfig.timeout = option.timeout * 1000
  }

  if (!axiosConfig.url) {
    results[stepId].push({
      request: axiosConfig,
      response: {
        isError: true,
        errorMessage: 'invalid url'
      }
    })
    throw new Error('invalid url')
  }

  const { timings, ...resultHttpReq } = await axios(axiosConfig)
    .then(res => ({
      status: res.status,
      headers: res.headers,
      data: res.data,
      timings: res.request.timings as Timings
    }))
    .catch((error: AxiosError) => ({
      status: error.status,
      headers: (error.response?.headers || {}) as AxiosResponseHeaders,
      data: error.response?.data || error.message,
      timings: error.request?._currentRequest?.timings as Timings
    }))

  if (resultHttpReq.headers['set-cookie']) {
    updateCookie(cookies, resultHttpReq.headers['set-cookie'])
  }

  const currentResult = {
    ...resultHttpReq,
    time: timings?.phases?.total,
    size: Number(resultHttpReq.headers?.["Content-Length"] as string || JSON.stringify(resultHttpReq.data).length)
  }

  console.log({ currentResult })

  environment[variable] = currentResult

  results[stepId].push({
    request: axiosConfig,
    response: {
      ...resultHttpReq,
      isError: false,
      timings,
      size: currentResult.size
    }
  })

  if (option?.sleepAfter)
    await sleep(option.sleepAfter * 1000)

  return environment;
}