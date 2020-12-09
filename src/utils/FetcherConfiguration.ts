export type RequestOptions = {
  url: string
  method: string
  attempts: number // Number of attempts to perform the request
  timeout: string // Time to abort the request. Time format accepted by ms: Examples: '0.5s', '2m', '3h', '100' (assumed to be milliseconds)
  waitTime: string // Time to wait between attempts. Time format accepted by ms: Examples: '0.5s', '2m', '3h', '100' (assumed to be milliseconds)
  body?: FormData | string
  headers?: Record<string, string>
}

export const FetcherDefaults = {
  method: 'GET',
  attempts: 1,
  waitTime: '1s',
  timeout: '5m'
}

export const FetchJsonDefaults = {
  ...FetcherDefaults,
  timeout: '30s',
  waitTime: '0.5s'
}
export const FetchBufferDefaults = {
  ...FetcherDefaults,
  timeout: '1m'
}
export const PostDefaults = {
  ...FetcherDefaults,
  method: 'POST'
}
