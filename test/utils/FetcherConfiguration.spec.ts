import chai from 'chai'
import chaiAsPromised from 'chai-as-promised'
import { CompleteRequestOptions, getAllHeaders } from 'utils'

chai.use(chaiAsPromised)
const expect = chai.expect

describe('FetcherConfiguration getAllHeaders', () => {
  it('When no cookie is set then the Set-Cookie header is not present', () => {
    const options: CompleteRequestOptions = {
      method: 'GET',
      attempts: 1,
      timeout: '30s',
      waitTime: '30s',
      headers: { header1: 'value1' }
    }

    const allHeaders: Record<string, string> = getAllHeaders(options)

    expect(allHeaders).to.have.property('header1', 'value1')
    expect(allHeaders).not.to.have.property('Set-Cookie')
  })

  it('When cookie is set then the Set-Cookie header is present', () => {
    const options: CompleteRequestOptions = {
      method: 'GET',
      attempts: 1,
      timeout: '30s',
      waitTime: '30s',
      headers: { header1: 'value1' },
      cookies: { JWT: 'aToken' }
    }

    const allHeaders: Record<string, string> = getAllHeaders(options)

    expect(allHeaders).to.have.property('header1', 'value1')
    expect(allHeaders).to.have.property('Set-Cookie', 'JWT=aToken')
  })
  it('When many cookies are set then the Set-Cookie header is present with all of them', () => {
    const options: CompleteRequestOptions = {
      method: 'GET',
      attempts: 1,
      timeout: '30s',
      waitTime: '30s',
      headers: { header1: 'value1' },
      cookies: { JWT: 'aToken', another: 'value2' }
    }

    const allHeaders: Record<string, string> = getAllHeaders(options)

    expect(allHeaders).to.have.property('header1', 'value1')
    expect(allHeaders).to.have.property('Set-Cookie', 'JWT=aToken; another=value2')
  })
})
