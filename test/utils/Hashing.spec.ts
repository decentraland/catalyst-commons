import chai from 'chai'
import chaiAsPromised from 'chai-as-promised'
import { Hashing } from '../../src/utils/Hashing'
import { readFileSync } from 'fs'
import { resolve } from 'path'
import { EntityContentItemReference } from 'types'

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

  it('v1 hashes multiple files correctly 1', async () => {
    const files: EntityContentItemReference[] = [
      { file: 'a.png', hash: 'bafybeibdik2ihfpcdi7aaaguptwcoc5msav7uhn5hu54xlq2pdwkh5arzy' }
    ]
    const { hash } = await Hashing.calculateMultipleHashesADR32(files)
    expect(hash).to.eq('bafkreigwbjbqaaf63q2cnbrqebctyo3a5y6oxos47usvexhvzajkoczspa')
  })
  it('v1 hashes multiple files correctly 2', async () => {
    const files: EntityContentItemReference[] = [
      { file: 'a.png', hash: 'bafybeibdik2ihfpcdi7aaaguptwcoc5msav7uhn5hu54xlq2pdwkh5arzy' },
      { file: 'a/b.png', hash: 'bafybeibdik2ihfpcdi7aaaguptwcoc5msav7uhn5hu54xlq2pdwkh5asd' }
    ]
    const { hash } = await Hashing.calculateMultipleHashesADR32(files)
    expect(hash).to.eq('bafkreih5bj5fxz72bgvhlqq35teesr75wysn2qcjayyi7kehdcyeiosgdi')
  })
  it('v1 hashes multiple files correctly, changing metadata changes the final hash', async () => {
    const files: EntityContentItemReference[] = [
      { file: 'a.png', hash: 'bafybeibdik2ihfpcdi7aaaguptwcoc5msav7uhn5hu54xlq2pdwkh5arzy' },
      { file: 'a/b.png', hash: 'bafybeibdik2ihfpcdi7aaaguptwcoc5msav7uhn5hu54xlq2pdwkh5asd' }
    ]
    const { hash } = await Hashing.calculateMultipleHashesADR32(files, { key: 'value' })
    expect(hash).to.eq('bafkreieusocjbdoxg5cdqtysltk353l3mtmzvtyhza6zxvwfjsfjrcm2ze')
  })
})
