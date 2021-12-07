import ms from 'ms'
import AbortController from 'abort-controller'
import { mergeRequestOptions, retry } from './Helper'
import crossFetch from 'cross-fetch'

import {
  CompleteRequestOptions,
  FETCH_BUFFER_DEFAULTS,
  FETCH_JSON_DEFAULTS,
  getAllHeaders,
  POST_DEFAULTS,
  RequestOptions
} from './FetcherConfiguration'

export class Fetcher {
  customDefaults: Omit<RequestOptions, 'body'>

  constructor(customDefaults?: Omit<RequestOptions, 'body'>) {
    this.customDefaults = customDefaults ?? {}
  }

  overrideDefaults(overrideDefaults: Omit<RequestOptions, 'body'>): void {
    this.customDefaults = mergeRequestOptions(this.customDefaults, overrideDefaults)
  }

  fetch(url: string, options?: Partial<CompleteRequestOptions>): Promise<Response> {
    return fetchInternal(url, {
      method: 'get',
      // it is better to not assume how this generic fetch will be used, not sending retries
      attempts: 1,
      // no timeout by default
      timeout: '0s',
      // no wait-time by default
      waitTime: '0s',
      ...mergeRequestOptions(this.customDefaults, options)
    })
  }

  /**
   * @deprecated please use Fetcher.fetch instead
   */
  fetchJson(url: string, options?: RequestOptions): Promise<unknown> {
    return fetchJson(url, mergeRequestOptions(this.customDefaults, options))
  }

  /**
   * @deprecated please use Fetcher.fetch instead
   */
  fetchBuffer(url: string, options?: RequestOptions): Promise<Buffer> {
    return fetchBuffer(url, mergeRequestOptions(this.customDefaults, options))
  }

  /**
   * Fetches the url and pipes the response obtained from the upstream to the `writeTo` Stream and
   * returns the headers from the upstream request.
   * IMPORTANT: THIS METHOD DOES NOT AWAIT THE PIPE TO FINISH. THE PROMISE FULFILLS RIGHT AFTER WE RECEIVE THE HEADERS.
   * @param url to request
   * @param writeTo the stream to pipe the response to
   * @param options config for the request
   * @deprecated please use Fetcher.fetch instead
   */
  fetchPipe(url: string, writeTo: any, options?: RequestOptions): Promise<Headers> {
    return fetchPipe(url, writeTo, mergeRequestOptions(this.customDefaults, options))
  }

  /**
   * @deprecated please use Fetcher.fetch instead
   */
  postForm(url: string, options?: RequestOptions): Promise<unknown> {
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

export async function fetchJson(url: string, options?: RequestOptions): Promise<unknown> {
  const response = await fetchInternal(url, mergeRequestOptions(FETCH_JSON_DEFAULTS, options))
  return response.json()
}

export async function fetchArrayBuffer(url: string, options?: RequestOptions): Promise<Uint8Array> {
  const response = await fetchInternal(url, mergeRequestOptions(FETCH_BUFFER_DEFAULTS, options))
  return new Uint8Array(await response.arrayBuffer())
}

/**
 * @deprecated use fetchArrayBuffer instead
 */
export async function fetchBuffer(url: string, options?: RequestOptions): Promise<Buffer> {
  const response = await fetchInternal(url, mergeRequestOptions(FETCH_BUFFER_DEFAULTS, options))
  return Buffer.from(await response.arrayBuffer())
}

/**
 * Fetches the url and pipes the response obtained from the upstream to the `writeTo` Stream and
 * returns the headers from the upstream request.
 * IMPORTANT: THIS METHOD DOES NOT AWAIT THE PIPE TO FINISH. THE PROMISE FULFILLS RIGHT AFTER WE RECEIVE THE HEADERS.
 * @param url to request
 * @param writeTo the stream to pipe the response to
 * @param options config for the request
 */
export async function fetchPipe(url: string, writeTo: any, options?: RequestOptions): Promise<Headers> {
  const response = await fetchInternal(url, mergeRequestOptions(FETCH_BUFFER_DEFAULTS, options))

  if (!response.body) throw new Error('The function fetchPipe only works in Node.js compatible enviroments')

  if ('pipe' in response.body) {
    ;(response.body as any).pipe(writeTo)
    return response.headers
  }

  throw new Error('The function fetchPipe only works in Node.js compatible enviroments')
}

export async function postForm(url: string, options?: RequestOptions): Promise<unknown> {
  const res = await fetchInternal(url, mergeRequestOptions(POST_DEFAULTS, options))
  return res.json()
}

export type GraphQLResponse = {
  errors: any[]
  data: any
}

export async function queryGraph<T = any>(
  url: string,
  query: string,
  variables: Record<string, any>,
  options?: RequestOptions
): Promise<T> {
  const response = (await postForm(url, {
    body: JSON.stringify({ query, variables }),
    headers: { 'Content-Type': 'application/json' },
    ...options
  })) as GraphQLResponse
  if (response.errors) {
    throw new Error(`Error querying graph. Reasons: ${JSON.stringify(response.errors)}`)
  }
  return response.data
}

async function identity<T>(a: T): Promise<T> {
  return a
}

/**
 * This is the method where everything happens, all of the methods in this file call internally fetchInternal.
 * If you need to modify something for all requests, do it here.
 */
async function fetchInternal(url: string, options: CompleteRequestOptions): Promise<Response> {
  return retry(
    async () => {
      const controller = new AbortController()
      const transformRequest = options.requestMiddleware || identity
      const transformResponse = options.responseMiddleware || identity

      const request = await transformRequest({
        requestInfo: url,
        requestInit: {
          signal: controller.signal,
          body: options.body,
          method: options.method,
          headers: getAllHeaders(options)
        }
      })

      // schedule timeout right after transforming Request
      const timeoutTime = ms(options.timeout)
      const timeout = timeoutTime
        ? setTimeout(() => {
            controller.abort()
          }, timeoutTime)
        : 0

      try {
        const response: Response = await crossFetch(request.requestInfo, request.requestInit)
        if (response.ok) {
          return await transformResponse(response)
        } else {
          const responseText = await response.text()
          throw new Error(`Failed to fetch ${url}. Got status ${response.status}. Response was '${responseText}'`)
        }
      } finally {
        if (timeout) clearTimeout(timeout)
      }
    },
    options.attempts,
    options.waitTime
  )
}
