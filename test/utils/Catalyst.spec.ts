import chai from 'chai'
import chaiAsPromised from 'chai-as-promised'
import { HTTPProvider } from 'eth-connect'
import { getCatalystFromProvider } from '../../src/utils'
import 'isomorphic-fetch'

chai.use(chaiAsPromised)
const expect = chai.expect

describe('Catalyst server list', () => {
  it('loads the catalysts from mainnet', async () => {
    const provider = new HTTPProvider('https://rpc.decentraland.org/mainnet')
    const servers = await getCatalystFromProvider(provider)
    expect(servers.length).to.greaterThan(0)
    expect(typeof servers[0].id).to.eq('string')
    expect(typeof servers[0].address).to.eq('string')
    expect(typeof servers[0].domain).to.eq('string')
    expect(typeof servers[0].id).to.eq('string')
  }).timeout('30s')

  it('loads the catalysts from ropsten', async () => {
    const provider = new HTTPProvider('https://rpc.decentraland.org/ropsten')
    const servers = await getCatalystFromProvider(provider)
    expect(servers.length).to.greaterThan(0)
    expect(typeof servers[0].id).to.eq('string')
    expect(typeof servers[0].address).to.eq('string')
    expect(typeof servers[0].domain).to.eq('string')
    expect(typeof servers[0].id).to.eq('string')
  }).timeout('30s')
})
