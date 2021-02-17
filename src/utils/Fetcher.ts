import ms from 'ms'
import AbortController from 'abort-controller'
import { clearTimeout, setTimeout } from 'timers'
import { mergeRequestOptions, retry } from './Helper'
import blobToBuffer from 'blob-to-buffer'
import crossFetch from 'cross-fetch'

import {
  CompleteRequestOptions,
  FETCH_BUFFER_DEFAULTS,
  FETCH_JSON_DEFAULTS,
  POST_DEFAULTS,
  RequestOptions
} from './FetcherConfiguration'

export class Fetcher {
  constructor(private readonly customDefaults?: Omit<RequestOptions, 'body'>) {}

  async fetchJson(url: string, options?: RequestOptions): Promise<any> {
    return this.fetchInternal(
      url,
      (response) => response.json(),
      this.completeOptionsWithDefault(FETCH_JSON_DEFAULTS, options)
    )
  }

  async fetchBuffer(url: string, options?: RequestOptions): Promise<Buffer> {
    return this.fetchInternal(
      url,
      (response) => this.extractBuffer(response),
      this.completeOptionsWithDefault(FETCH_BUFFER_DEFAULTS, options)
    )
  }

  async fetchPipe(
    url: string,
    writeTo: ReadableStream<Uint8Array>,
    options?: RequestOptions
  ): Promise<Map<string, string>> {
    return this.fetchInternal(
      url,
      (response) => this.copyResponse(response, writeTo),
      this.completeOptionsWithDefault(FETCH_BUFFER_DEFAULTS, options)
    )
  }

  private KNOWN_HEADERS: string[] = [
    'Content-Type',
    'Access-Control-Allow-Origin',
    'Access-Control-Expose-Headers',
    'ETag',
    'Date',
    'Content-Length',
    'Cache-Control'
  ]

  private async copyResponse(response: Response, writeTo: ReadableStream<Uint8Array>): Promise<Map<string, string>> {
    // The method pipeTo() is not working, so we need to use pipe() which is the one implemented
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    response.body.pipe(writeTo)
    return this.onlyKnownHeaders(response)
  }

  private fixHeaderNameCase(headerName: string): string | undefined {
    return this.KNOWN_HEADERS.find((item) => item.toLowerCase() === headerName.toLowerCase())
  }

  private onlyKnownHeaders(responseFrom: Response): Map<string, string> {
    const headers: Map<string, string> = new Map()
    responseFrom.headers.forEach((headerValue, headerName) => {
      const fixedHeader = this.fixHeaderNameCase(headerName)
      if (fixedHeader) {
        headers.set(fixedHeader, headerValue)
      }
    })
    return headers
  }

  async postForm(url: string, options?: RequestOptions): Promise<any> {
    return this.fetchInternal(
      url,
      (response) => response.json(),
      this.completeOptionsWithDefault(POST_DEFAULTS, options)
    )
  }

  async queryGraph<T = any>(
    url: string,
    query: string,
    variables: Record<string, any>,
    options?: RequestOptions
  ): Promise<T> {
    const response = await this.postForm(
      url,
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
    url: string,
    responseConsumer: (response: Response) => Promise<T>,
    options: CompleteRequestOptions
  ): Promise<T> {
    return retry(
      async () => {
        const controller = new AbortController()
        const timeout = setTimeout(() => {
          controller.abort()
        }, ms(options.timeout))

        try {
          const response: Response = await crossFetch(url, {
            signal: controller.signal,
            body: options.body,
            method: options.method,
            headers: options.headers
          })
          if (response.ok) {
            return await responseConsumer(response)
          } else {
            const responseText = await response.text()
            throw new Error(`Failed to fetch ${url}. Got status ${response.status}. Response was '${responseText}'`)
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

  private completeOptionsWithDefault(
    methodOptions: CompleteRequestOptions,
    requestOptions?: RequestOptions
  ): CompleteRequestOptions {
    return mergeRequestOptions(mergeRequestOptions(methodOptions, this.customDefaults), requestOptions)
  }
}
