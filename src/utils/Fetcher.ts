import ms from "ms";
require('isomorphic-fetch');
import rfetch from '@nrk/rfetch'
import { applyDefaults } from "./Helper";

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
        return this.fetchInternal(url, response => response.buffer(), opts)
    }

    async postForm(url: string, body: FormData | string, headers: any = { }, options?: RequestOptions): Promise<any> {
        const opts = applyDefaults({ attempts: 1,
            timeout: this.defaultPostTimeout,
            waitTime: '1s',
        }, options)

        return this.fetchInternal(url, response => response.json(), opts, 'POST', body, headers)
    }

    private async fetchInternal<T>(url: string, responseConsumer: (response) => Promise<T>, options: CompleteRequestOptions, method: string = 'GET', body?: FormData | string, headers: any = { }): Promise<T> {
        if (options.attempts <= 0) {
            throw new Error('You must set at least one attempt.')
        }
        const response = await rfetch(url, { body, method, headers }, { signalTimeout: ms(options.timeout), retries: options.attempts, retryTimeout: ms(options.waitTime) });
        if (response.ok) {
            return await responseConsumer(response)
        }
        const responseText = await response.text()
        throw new Error(`Failed to fetch ${url}. Got status ${response.status}. Response was '${responseText}'`)
    }

}

export type RequestOptions = Partial<CompleteRequestOptions>

type CompleteRequestOptions = {
    attempts: number, // Number of attempts to perform the request
    timeout: string, // Time to abort the request. Time format accepted by ms
    waitTime: string, // Time to wait between attempts. Time format accepted by ms
    // Time format accepted by ms: Examples: '0.5s', '2m', '3h', '100' (assumed to be milliseconds)
}
