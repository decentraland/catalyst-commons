import ms from 'ms'
import AbortController from 'abort-controller'
import crossFetch from 'cross-fetch'
import blobToBuffer from 'blob-to-buffer'
import merge from 'deepmerge'
import { clearTimeout, setTimeout } from 'timers'
import { retry } from './Helper'
import { FETCH_BUFFER_DEFAULTS, FETCH_JSON_DEFAULTS, POST_DEFAULTS, RequestOptions } from './FetcherConfiguration'

export class Fetcher {
  private readonly fetchJsonDefaults
  private readonly fetchBufferDefaults
  private readonly postDefaults

  constructor(customDefaults: Partial<RequestOptions>) {
    this.fetchJsonDefaults = merge(FETCH_JSON_DEFAULTS, customDefaults)
    this.fetchBufferDefaults = merge(FETCH_BUFFER_DEFAULTS, customDefaults)
    this.postDefaults = merge(POST_DEFAULTS, customDefaults)
  }

  async fetchJson(options: Partial<RequestOptions> & Pick<RequestOptions, 'url'>): Promise<any> {
    return this.fetchInternal((response) => response.json(), merge(this.fetchJsonDefaults, options))
  }

  async fetchBuffer(options: Partial<RequestOptions> & Pick<RequestOptions, 'url'>): Promise<Buffer> {
    return this.fetchInternal((response) => this.extractBuffer(response), merge(this.fetchBufferDefaults, options))
  }

  async postForm(options: Partial<RequestOptions> & Pick<RequestOptions, 'url'>): Promise<any> {
    return this.fetchInternal((response) => response.json(), merge(this.postDefaults, options))
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
