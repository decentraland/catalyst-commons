export type RequestOptions = Partial<CompleteRequestOptions>

export type CompleteRequestOptions = {
  method: string
  attempts: number // Number of attempts to perform the request
  timeout: string // Time to abort the request. Time format accepted by ms: Examples: '0.5s', '2m', '3h', '100' (assumed to be milliseconds)
  waitTime: string // Time to wait between attempts. Time format accepted by ms: Examples: '0.5s', '2m', '3h', '100' (assumed to be milliseconds)
  body?: FormData | string
  headers?: Record<string, string>
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
