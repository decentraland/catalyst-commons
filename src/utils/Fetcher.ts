import ms from "ms";
import AbortController from 'abort-controller';
import crossFetch from 'cross-fetch'
import blobToBuffer from 'blob-to-buffer'
import { clearTimeout, setTimeout } from "timers"
import { applyDefaults, retry } from "./Helper";

export class Fetcher {

    constructor(private readonly defaultJsonRequestTimeout: string = '30s',
        private readonly defaultFileDownloadRequestTimeout: string = '1m',
        private readonly defaultPostTimeout: string = '5m') {}

    async fetchJson(url: string, options?: RequestOptions): Promise<any> {
        const opts = applyDefaults({ attempts: 1,
            timeout: this.defaultJsonRequestTimeout,
            waitTime: '0.5s',
        }, options)
        return this.fetchInternal(url, response => response.json(), opts)
    }

    async fetchBuffer(url: string, options?: RequestOptions): Promise<Buffer> {
        const opts = applyDefaults({ attempts: 1,
            timeout: this.defaultFileDownloadRequestTimeout,
            waitTime: '1s',
        }, options)
        return this.fetchInternal(url, response => this.extractBuffer(response), opts)
    }

    async postForm(url: string, body: FormData | string, headers: any = { }, options?: RequestOptions): Promise<any> {
        const opts = applyDefaults({ attempts: 1,
            timeout: this.defaultPostTimeout,
            waitTime: '1s',
        }, options)

        return this.fetchInternal(url, response => response.json(), opts, 'POST', body, headers)
    }

    private async fetchInternal<T>(url: string, responseConsumer: (response: Response) => Promise<T>, options: CompleteRequestOptions, method: string = 'GET', body?: FormData | string, headers: any = { }): Promise<T> {
        return retry(async () => {
            const controller = new AbortController();
            const timeout = setTimeout(() => {
                controller.abort();
            }, ms(options.timeout));

            try {
                const response = await crossFetch(url, { signal: controller.signal, body, method, headers });
                if (response.ok) {
                    return await responseConsumer(response)
                } else {
                    const responseText = await response.text()
                    throw new Error(`Failed to fetch ${url}. Got status ${response.status}. Response was '${responseText}'`)
                }
            } finally {
                clearTimeout(timeout)
            }
        }, options.attempts, options.waitTime)
    }

    async queryGraph<T = any>(url: string, query: string, variables: Record<string, any>, options?: RequestOptions): Promise<T> {
        const json = await this.postForm(url, JSON.stringify({ query, variables }), { 'Content-Type': 'application/json' }, options)
        if (json.errors) {
            throw new Error(
                `Error querying graph. Reasons: ${JSON.stringify(json.errors)}`
            )
        }
        return json.data
    }

    private async extractBuffer(response: Response): Promise<Buffer> {
        if ('buffer' in response) {
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

export type RequestOptions = Partial<CompleteRequestOptions>

type CompleteRequestOptions = {
    attempts: number, // Number of attempts to perform the request
    timeout: string, // Time to abort the request. Time format accepted by ms
    waitTime: string, // Time to wait between attempts. Time format accepted by ms
    // Time format accepted by ms: Examples: '0.5s', '2m', '3h', '100' (assumed to be milliseconds)
}
