import chai from 'chai'
import chaiAsPromised from 'chai-as-promised'
import { Fetcher } from 'utils'

chai.use(chaiAsPromised)
const expect = chai.expect

describe('Fetcher', () => {

    it('When a timeout is set, then the fetch is aborted', async () => {
        const fetcher = new Fetcher()
        const fetch = fetcher.fetchBuffer('https://httpstat.us/200?sleep=10000', { timeout: '5s' })
        await expect(fetch).to.be.rejectedWith('The user aborted a request.')
    }).timeout('15s')

    it('When a timeout is set but not reached, then the fetch is successful', async () => {
        const fetcher = new Fetcher()
        await fetcher.fetchBuffer('https://httpstat.us/200', { timeout: '5s' })
    }).timeout('10s')

})
