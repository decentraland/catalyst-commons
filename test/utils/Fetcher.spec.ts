import chai from 'chai'
import mockttp = require('mockttp')
import chaiAsPromised from 'chai-as-promised'
import { delay, Fetcher } from 'utils'

chai.use(chaiAsPromised)
const expect = chai.expect
const mockServer = mockttp.getLocal()

describe('Fetcher', () => {
  beforeEach(() => {
    mockServer.start(8080)
  })
  afterEach(() => mockServer.stop())

  it('When a timeout is set, then the fetch is aborted', async () => {
    mockServer.get('/mocked-path').thenCallback(async () => {
      await delay('10000')
      return {}
    })

    const fetch = new Fetcher().fetchBuffer('http://localhost:8080/mocked-path', { timeout: '5s' })

    await expect(fetch).to.be.rejectedWith('The user aborted a request.')
  }).timeout('15s')

  it('When a timeout is set but not reached, then the fetch is successful', async () => {
    await mockServer.get('/mocked-path').thenReply(200, '{"body": "matching body"}')

    const fetch = new Fetcher().fetchBuffer('http://localhost:8080/mocked-path', { timeout: '5s' })

    expect((await fetch).toString()).to.include('matching body')
  }).timeout('10s')

  it('When making a POST with custom headers they are sent to the upstream', async () => {
    await mockServer.post('/mocked-path').thenReply(200, '{"body": "matching body"}')

    const fetch = new Fetcher().postForm('http://localhost:8080/mocked-path', {
      headers: { 'User-Agent': 'ContentServer/v2' }
    })

    expect((await fetch).body).to.include('matching body')
    await assertFetchHasHeader('User-Agent', 'ContentServer/v2')
  }).timeout('10s')

  it('When making a GET JSON with custom headers they are sent to the upstream', async () => {
    await mockServer.get('/mocked-path').thenReply(200, '{"body": "matching body"}')

    const fetch = new Fetcher().fetchJson('http://localhost:8080/mocked-path', {
      headers: { 'User-Agent': 'ContentServer/v2' }
    })

    expect((await fetch).body).to.include('matching body')
    await assertFetchHasHeader('User-Agent', 'ContentServer/v2')
  }).timeout('10s')

  it('When making a GET Buffer with custom headers they are sent to the upstream', async () => {
    await mockServer.get('/mocked-path').thenReply(200, '{"body": "matching body"}')

    const fetch = new Fetcher().fetchBuffer('http://localhost:8080/mocked-path', {
      headers: { 'User-Agent': 'ContentServer/v2' }
    })

    expect((await fetch).toString()).to.include('matching body')
    await assertFetchHasHeader('User-Agent', 'ContentServer/v2')
  }).timeout('10s')

  it('When configuring a Fetcher with custom defaults headers then every request has them', async () => {
    await mockServer.get('/mocked-path').thenReply(200, '{"body": "matching body"}')
    const fetcherWithHeadersConfig = new Fetcher({ headers: { 'User-Agent': 'ContentServer/v2' } })

    const fetch = fetcherWithHeadersConfig.fetchJson('http://localhost:8080/mocked-path')

    expect((await fetch).body).to.include('matching body')
    await assertFetchHasHeader('User-Agent', 'ContentServer/v2')
  }).timeout('10s')

  it('Given a Fetcher with custom defaults headers when configuring a header override then all headers are present', async () => {
    await mockServer.get('/mocked-path').thenReply(200, '{"body": "matching body"}')
    const fetcherWithHeadersConfig = new Fetcher({ headers: { 'User-Agent': 'ContentServer/v2' } })

    const fetch = fetcherWithHeadersConfig.fetchJson('http://localhost:8080/mocked-path', {
      headers: { 'another-header': 'another-value' },
      timeout: '10s'
    })

    expect((await fetch).body).to.include('matching body')
    await assertFetchHasHeader('User-Agent', 'ContentServer/v2')
    await assertFetchHasHeader('another-header', 'another-value')
  }).timeout('10s')

  it('Given a Fetcher with custom defaults headers when overriding the value then it is present', async () => {
    await mockServer.get('/mocked-path').thenReply(200, '{"body": "matching body"}')
    const fetcherWithHeadersConfig = new Fetcher({ headers: { 'User-Agent': 'ContentServer/v2' } })

    const fetch = fetcherWithHeadersConfig.fetchJson('http://localhost:8080/mocked-path', {
      headers: { 'User-Agent': 'another-value' }
    })

    expect((await fetch).body).to.include('matching body')
    await assertFetchHasHeader('User-Agent', 'another-value')
  }).timeout('10s')
})

async function assertFetchHasHeader(headerKey: string, headerValue: string) {
  const mockedEndpoints = await mockServer.getMockedEndpoints()
  const seenRequests = await mockedEndpoints[0].getSeenRequests()
  expect(seenRequests.length).to.equal(1)
  expect(seenRequests[0].headers[headerKey.toLowerCase()]).to.equal(headerValue)
}
