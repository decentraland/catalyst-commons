import chai from 'chai'
import chaiAsPromised from 'chai-as-promised'
import { Hashing } from '../../src/utils/Hashing'
import { readFileSync } from 'fs'
import { resolve } from 'path'

chai.use(chaiAsPromised)
const expect = chai.expect

describe('Hashing', () => {
  it('v1 hashes the file correctly', async () => {
    expect(
      await Hashing.calculateIPFSHash(
        readFileSync(resolve(__dirname, '../files/bafybeibdik2ihfpcdi7aaaguptwcoc5msav7uhn5hu54xlq2pdwkh5arzy'))
      )
    ).to.eq('bafybeibdik2ihfpcdi7aaaguptwcoc5msav7uhn5hu54xlq2pdwkh5arzy')
  })

  it('v0 hashes the file correctly', async () => {
    expect(
      await Hashing.calculateBufferHash(
        readFileSync(resolve(__dirname, '../files/QmSYpJEQLQc82USvtavzxEiBR57nyb5RdMzecBTR3Qg6qn'))
      )
    ).to.eq('QmSYpJEQLQc82USvtavzxEiBR57nyb5RdMzecBTR3Qg6qn')
  })
})
