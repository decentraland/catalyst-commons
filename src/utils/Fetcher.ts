import ms from 'ms'
import AbortController from 'abort-controller'
import crossFetch from 'cross-fetch'
import blobToBuffer from 'blob-to-buffer'
import { clearTimeout, setTimeout } from 'timers'
import { retry } from './Helper'

export class Fetcher {
  private readonly defaults = {
    method: 'GET',
    responseType: ResponseType.JSON,
    attempts: 1,
    waitTime: '1s',
    timeout: '5m'
  }

  private readonly fetchJsonDefaults = {
    ...this.defaults,
    ...{
      timeout: '30s',
      waitTime: '0.5s'
    }
  }
  private readonly fetchBufferDefaults = {
    ...this.defaults,
    ...{
      timeout: '1m',
      responseType: ResponseType.Buffer
    }
  }
  private readonly postDefaults = {
    ...this.defaults,
    ...{
      method: 'POST'
    }
  }

  constructor() {}

  async fetchJson(options: Partial<RequestOptions> & Pick<RequestOptions, 'url'>): Promise<any> {
    return this.fetchInternal(this.responseJsonHandler(), Object.assign(this.fetchJsonDefaults, options))
  }

  async fetchBuffer(options: Partial<RequestOptions> & Pick<RequestOptions, 'url'>): Promise<Buffer> {
    return this.fetchInternal(this.responseBufferHandler(), Object.assign(this.fetchBufferDefaults, options))
  }

  async postForm(options: Partial<RequestOptions> & Pick<RequestOptions, 'url'>): Promise<any> {
    return this.fetchInternal(this.responseJsonHandler(), Object.assign(this.postDefaults, options))
  }

  async queryGraph<T = any>(
    query: string,
    variables: Record<string, any>,
    options: Partial<RequestOptions> & Pick<RequestOptions, 'url'>
  ): Promise<T> {
    const response = await this.postForm(
      Object.assign(
        { body: JSON.stringify({ query, variables }), headers: { 'Content-Type': 'application/json' } },
        options
      )
    )
    if (response.errors) {
      throw new Error(`Error querying graph. Reasons: ${JSON.stringify(response.errors)}`)
    }
    return response.data
  }

  private async fetchInternal<T>(
    responseConsumer: (response: Response) => Promise<T>,
    options: RequestOptions
  ): Promise<T> {
    return retry(
      async () => {
        const controller = new AbortController()
        const timeout = setTimeout(() => {
          controller.abort()
        }, ms(options.timeout))

        try {
          const response = await crossFetch(options.url, {
            signal: controller.signal,
            body: options.body,
            method: options.method,
            headers: options.headers
          })
          if (response.ok) {
            return await responseConsumer(response)
          } else {
            const responseText = await response.text()
            throw new Error(
              `Failed to fetch ${options.url}. Got status ${response.status}. Response was '${responseText}'`
            )
          }
        } finally {
          clearTimeout(timeout)
        }
      },
      options.attempts,
      options.waitTime
    )
  }

  private responseJsonHandler(): (response: Response) => Promise<any> {
    return (response) => response.json()
  }

  private responseBufferHandler(): (response: Response) => Promise<any> {
    return (response) => this.extractBuffer(response)
  }

  private async extractBuffer(response: Response): Promise<Buffer> {
    if ('buffer' in response) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      return response.buffer()
    }
    const blob = await response.blob()
    return this.asyncBlobToBuffer(blob)
  }

  private asyncBlobToBuffer(blob: Blob): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      blobToBuffer(blob, (err: Error, buffer: Buffer) => {
        if (err) reject(err)
        resolve(buffer)
      })
    })
  }
}

enum ResponseType {
  JSON,
  Buffer
}

type RequestOptions = {
  url: string
  method: string
  responseType: ResponseType
  // Time format accepted by ms: Examples: '0.5s', '2m', '3h', '100' (assumed to be milliseconds)
  attempts: number // Number of attempts to perform the request
  timeout: string // Time to abort the request. Time format accepted by ms
  waitTime: string // Time to wait between attempts. Time format accepted by ms
  body?: FormData | string
  headers?: Record<string, string>
}
