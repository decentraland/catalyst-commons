import ms from 'ms'
import AbortController from 'abort-controller'
import { clearTimeout, setTimeout } from 'timers'
import { mergeRequestOptions, retry } from './Helper'
import blobToBuffer from 'blob-to-buffer'
import crossFetch from 'cross-fetch'

import {
  CompleteRequestOptions,
  CrossFetchRequest,
  FETCH_BUFFER_DEFAULTS,
  FETCH_JSON_DEFAULTS,
  getAllHeaders,
  POST_DEFAULTS,
  RequestOptions
} from './FetcherConfiguration'

export class Fetcher {
  private customDefaults: Omit<RequestOptions, 'body'>

  constructor(customDefaults?: Omit<RequestOptions, 'body'>) {
    this.customDefaults = customDefaults ?? {}
  }

  overrideDefaults(overrideDefaults: Omit<RequestOptions, 'body'>): void {
    this.customDefaults = mergeRequestOptions(this.customDefaults, overrideDefaults)
  }

  fetchJson(url: string, options?: RequestOptions): Promise<any> {
    return fetchJson(url, mergeRequestOptions(this.customDefaults, options))
  }

  fetchBuffer(url: string, options?: RequestOptions): Promise<Buffer> {
    return fetchBuffer(url, mergeRequestOptions(this.customDefaults, options))
  }

  /**
   * Fetches the url and pipes the response obtained from the upstream to the `writeTo` Stream and
   *  returns the headers from the upstream request.
   * @param url to request
   * @param writeTo the stream to pipe the response to
   * @param options config for the request
   */
  fetchPipe(url: string, writeTo: ReadableStream<Uint8Array>, options?: RequestOptions): Promise<Headers> {
    return fetchPipe(url, writeTo, mergeRequestOptions(this.customDefaults, options))
  }

  postForm(url: string, options?: RequestOptions): Promise<any> {
    return postForm(url, mergeRequestOptions(this.customDefaults, options))
  }

  queryGraph<T = any>(
    url: string,
    query: string,
    variables: Record<string, any>,
    options?: RequestOptions
  ): Promise<T> {
    return queryGraph(url, query, variables, mergeRequestOptions(this.customDefaults, options))
  }

  // Clones the fetcher and creates a new one
  clone(): Fetcher {
    return new Fetcher(this.customDefaults)
  }
}

export async function fetchJson(url: string, options?: RequestOptions): Promise<any> {
  return fetchInternal(url, (response) => response.json(), mergeRequestOptions(FETCH_JSON_DEFAULTS, options))
}

export async function fetchBuffer(url: string, options?: RequestOptions): Promise<Buffer> {
  return fetchInternal(url, (response) => extractBuffer(response), mergeRequestOptions(FETCH_BUFFER_DEFAULTS, options))
}

/**
 * Fetches the url and pipes the response obtained from the upstream to the `writeTo` Stream and
 *  returns the headers from the upstream request.
 * @param url to request
 * @param writeTo the stream to pipe the response to
 * @param options config for the request
 */
export async function fetchPipe(
  url: string,
  writeTo: ReadableStream<Uint8Array>,
  options?: RequestOptions
): Promise<Headers> {
  return fetchInternal(
    url,
    (response) => copyResponse(response, writeTo),
    mergeRequestOptions(FETCH_BUFFER_DEFAULTS, options)
  )
}

async function copyResponse(response: Response, writeTo: ReadableStream<Uint8Array>): Promise<Headers> {
  // The method pipeTo() is not working, so we need to use pipe() which is the one implemented
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  response.body.pipe(writeTo)
  return response.headers
}

export async function postForm(url: string, options?: RequestOptions): Promise<any> {
  return fetchInternal(url, (response) => response.json(), mergeRequestOptions(POST_DEFAULTS, options))
}

export async function queryGraph<T = any>(
  url: string,
  query: string,
  variables: Record<string, any>,
  options?: RequestOptions
): Promise<T> {
  const response = await postForm(
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

/**
 * This is the method where everything happens, all of the methods in this file call internally fetchInternal.
 * If you need to modify something for all requests, do it here.
 */
async function fetchInternal<T>(
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

      let request: CrossFetchRequest = {
        requestInfo: url,
        requestInit: {
          signal: controller.signal,
          body: options.body,
          method: options.method,
          headers: getAllHeaders(options)
        }
      }
      if (options.requestMiddleware) {
        request = await options.requestMiddleware(request)
      }
      try {
        let response: Response = await crossFetch(request.requestInfo, request.requestInit)
        if (response.ok) {
          if (options.responseMiddleware) {
            response = await options.responseMiddleware(response)
          }
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

async function extractBuffer(response: Response): Promise<Buffer> {
  if ('buffer' in response) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return response.buffer()
  }
  const blob = await response.blob()
  return asyncBlobToBuffer(blob)
}

function asyncBlobToBuffer(blob: Blob): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    blobToBuffer(blob, (err: Error, buffer: Buffer) => {
      if (err) reject(err)
      resolve(buffer)
    })
  })
}
