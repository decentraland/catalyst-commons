export type RequestOptions = Partial<CompleteRequestOptions>
import cookie from 'cookie'

export type CrossFetchRequest = {
  requestInfo: string | RequestInfo
  requestInit?: RequestInit
}

export type CompleteRequestOptions = {
  method: string
  attempts: number // Number of attempts to perform the request
  timeout: string // Time to abort the request. Time format accepted by ms: Examples: '0.5s', '2m', '3h', '100' (assumed to be milliseconds)
  waitTime: string // Time to wait between attempts. Time format accepted by ms: Examples: '0.5s', '2m', '3h', '100' (assumed to be milliseconds)
  body?: FormData | string
  headers?: Record<string, string>
  cookies?: Record<string, string>
  // Configure a lambda to execute with the request, before executing it.
  // This is used when you need to configure something of the fetcher according to the generated request.
  requestMiddleware?: (request: CrossFetchRequest) => Promise<CrossFetchRequest>
  // Configure a lambda to execute with the response if it was okay.
  // This is used when you need to configure something of the fetcher according to the response obtained.
  responseMiddleware?: (response: Response) => Promise<Response>
}

export function getAllHeaders(options: CompleteRequestOptions): Record<string, string> {
  const headers = options.headers || {}
  if (options.cookies && Object.entries(options.cookies).length > 0) {
    headers['Cookie'] = Object.entries(options.cookies)
      .map((entry) => cookie.serialize(entry[0], entry[1]))
      .reduce((a, b) => `${a}; ${b}`)
  }
  return headers
}

export const FETCHER_DEFAULTS = {
  method: 'GET',
  attempts: 1,
  waitTime: '1s',
  timeout: '5m'
}

export const FETCH_JSON_DEFAULTS = {
  ...FETCHER_DEFAULTS,
  timeout: '30s',
  waitTime: '0.5s'
}
export const FETCH_BUFFER_DEFAULTS = {
  ...FETCHER_DEFAULTS,
  timeout: '1m'
}
export const POST_DEFAULTS = {
  ...FETCHER_DEFAULTS,
  method: 'POST'
}
