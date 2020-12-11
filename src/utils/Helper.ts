import ms from 'ms'
import { CompleteRequestOptions, RequestOptions } from './FetcherConfiguration'

export function delay(time: string): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms(time)))
}

export async function retry<T>(
  execution: () => Promise<T>,
  attempts: number,
  waitTime: string = '1s',
  failedAttemptCallback?: (attemptsLeft: number) => void,
  allFailedCallback?: () => void
): Promise<T> {
  while (attempts > 0) {
    try {
      return await execution()
    } catch (error) {
      attempts--
      if (attempts > 0) {
        if (failedAttemptCallback) {
          failedAttemptCallback(attempts)
        }
        await delay(waitTime)
      } else {
        if (allFailedCallback) {
          allFailedCallback()
        }
        return Promise.reject(error)
      }
    }
  }
  return Promise.reject(new Error('Should never reach here'))
}

/** Add defaults to missing properties in the partial object */
export function applyDefaults<T>(defaults: T, partial?: Partial<T>): T {
  const complete = Object.assign(defaults, partial)
  return complete
}

/** Add some defaults to missing properties in the partial object. This means that the object is not yet complete */
export function applySomeDefaults<T>(defaults: Partial<T>, partial?: Partial<T>): Partial<T> {
  const complete = Object.assign(defaults, partial)
  return complete
}

export function mergeRequestOptions(
  aRequestOption: CompleteRequestOptions,
  anotherRequestOption: RequestOptions
): CompleteRequestOptions {
  const headers: Record<string, string> = { ...aRequestOption.headers, ...anotherRequestOption.headers }
  const result: CompleteRequestOptions = applyDefaults(aRequestOption, anotherRequestOption)
  result.headers = headers
  return result
}
