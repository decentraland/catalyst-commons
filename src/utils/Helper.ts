import ms from 'ms'
import { CompleteRequestOptions, RequestOptions } from './FetcherConfiguration'

export function delay(time: string): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms(time)))
}

export async function retry<T>(
  execution: () => Promise<T>,
  attempts: number,
  waitTime: string = '1s',
  failedAttemptCallback?: (attemptsLeft: number) => void
): Promise<T> {
  while (attempts > 0) {
    try {
      return await execution()
      //     ^^^^^ never remove this "await" keyword, otherwise this function won't
      //           catch the exception and perform the retries
    } catch (error) {
      attempts--
      if (attempts > 0) {
        if (failedAttemptCallback) {
          failedAttemptCallback(attempts)
        }
        await delay(waitTime)
      } else {
        throw error
      }
    }
  }
  throw new Error('Please specify more than one attempt for the retry function')
}

/** Add defaults to missing properties in the partial object */
export function applyDefaults<T, K = T | Partial<T>>(defaults: K, partial?: Partial<T>): K {
  return { ...defaults, ...partial }
}

/** Add some defaults to missing properties in the partial object. This means that the object is not yet complete */
export function applySomeDefaults<T>(defaults: Partial<T>, partial?: Partial<T>): Partial<T> {
  return { ...defaults, ...partial }
}

/**  As headers field is Record<string, string> type, then when merging request Options
     it's needed to merge the array instead of just applying the defaults.           */
export function mergeRequestOptions<T = CompleteRequestOptions | RequestOptions>(
  target: T,
  source?: RequestOptions
): T {
  const combinedHeaders: Record<string, string> = {
    ...(target as RequestOptions)?.headers,
    ...source?.headers
  }
  const combinedCookies: Record<string, string> = {
    ...(target as RequestOptions)?.cookies,
    ...source?.cookies
  }
  return { ...target, ...source, headers: combinedHeaders, cookies: combinedCookies }
}
