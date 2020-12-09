export enum FetcherResponseType {
  JSON,
  Buffer
}

export type RequestOptions = {
  url: string
  method: string
  responseType: FetcherResponseType
  // Time format accepted by ms: Examples: '0.5s', '2m', '3h', '100' (assumed to be milliseconds)
  attempts: number // Number of attempts to perform the request
  timeout: string // Time to abort the request. Time format accepted by ms
  waitTime: string // Time to wait between attempts. Time format accepted by ms
  body?: FormData | string
  headers?: Record<string, string>
}

export class FetcherConfiguration {
  static defaults = {
    method: 'GET',
    responseType: FetcherResponseType.JSON,
    attempts: 1,
    waitTime: '1s',
    timeout: '5m'
  }

  static fetchJsonDefaults = {
    ...FetcherConfiguration.defaults,
    ...{
      timeout: '30s',
      waitTime: '0.5s'
    }
  }
  static fetchBufferDefaults = {
    ...FetcherConfiguration.defaults,
    ...{
      timeout: '1m',
      responseType: FetcherResponseType.Buffer
    }
  }
  static postDefaults = {
    ...FetcherConfiguration.defaults,
    ...{
      method: 'POST'
    }
  }
}
