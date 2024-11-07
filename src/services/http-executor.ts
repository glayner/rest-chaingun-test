
import axios, { AxiosError, AxiosRequestConfig, AxiosResponseHeaders } from 'axios';
import https from 'https';
import qs from 'qs';
import { ChaingunDataController, ChaingunTestStep, Timings } from "../types";
import { formatCookie, updateCookie } from '../utils/cookie';
import timer from '../utils/http-timer';
import { sleep } from "../utils/sleep";
import { replaceMarkers } from '../utils/variable-replacement';


export async function executeHttpRequest(
  chaingunDataController: ChaingunDataController,
  step: ChaingunTestStep,
  environment: Record<string, any>): Promise<{ chaingunDataController: ChaingunDataController, environment: Record<string, any> }> {
  if (step.action !== 'Http.get' &&
    step.action !== 'Http.post' &&
    step.action !== 'Http.delete' &&
    step.action !== 'Http.put' &&
    step.action !== 'Http.patch') return { chaingunDataController, environment };

  const transport = {
    request: function httpsWithTimer(...args: any[]) {
      const request = https.request.apply(null, args as any)
      timer(request)

      return request
    }
  }

  const { bodyType, variable, form = {}, option, payload } = step.parameters
  let { url, headers = {}, params = {} } = step.parameters

  const method = step.action.split('.')[1].toUpperCase()

  url = replaceMarkers(url, environment)
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
  const stepId = step._id as string

  if (!results[stepId]) {
    results[stepId] = []
  }

  headers['Cookie'] = formatCookie(cookies)


  const axiosConfig: AxiosRequestConfig = {
    method: step.action.split('.')[1].toUpperCase(),
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

  if (!axiosConfig.url || !axiosConfig.url.startsWith('http')) {
    const invalidUrlMessage = `Url path has invalid format: "${axiosConfig.url}"`
    results[stepId].push({
      request: axiosConfig,
      response: {
        isError: true,
        errorMessage: invalidUrlMessage
      }
    })
    throw new Error(invalidUrlMessage)
  }

  const { timings, ...resultHttpReq } = await axios(axiosConfig)
    .then(res => ({
      status: res.status,
      headers: res.headers,
      data: res.data,
      timings: res.request.timings as Timings,
      isError: false,
      errorMessage: undefined
    }))
    .catch((error: AxiosError) => ({
      status: error.status,
      headers: (error.response?.headers || {}) as AxiosResponseHeaders,
      data: error.response?.data || error.message,
      timings: error.request?._currentRequest?.timings as Timings,
      isError: !error.request,
      errorMessage: error.message
    }))

  if (resultHttpReq.headers['set-cookie']) {
    updateCookie(cookies, resultHttpReq.headers['set-cookie'])
  }

  const currentResult = {
    ...resultHttpReq,
    time: timings?.phases?.total,
    size: resultHttpReq.isError ? undefined : Number(
      resultHttpReq.headers?.["Content-Length"] as string ||
      JSON.stringify(resultHttpReq.data).length
    )
  }

  results[stepId].push({
    request: axiosConfig,
    response: {
      ...resultHttpReq,
      timings,
      size: currentResult.size
    }
  })

  if (resultHttpReq.isError) {
    throw new Error(resultHttpReq.errorMessage)
  }

  environment[variable] = currentResult

  if (option?.sleepAfter)
    await sleep(option.sleepAfter * 1000)

  return { chaingunDataController, environment };
}