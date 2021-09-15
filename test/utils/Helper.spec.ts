import chai from 'chai'
import chaiAsPromised from 'chai-as-promised'
import { applyDefaults, applySomeDefaults, retry } from '../../src/utils/Helper'

chai.use(chaiAsPromised)
const expect = chai.expect

describe('Helper', () => {
  it('When default are applied, the result object is the expected one', () => {
    type MyType = { prop1: string; prop2: string }
    const object: Partial<MyType> = { prop1: 'value1' }
    const defaults: MyType = { prop1: 'def1', prop2: 'def2' }

    const result = applyDefaults(defaults, object)

    expect(result).to.have.property('prop1', 'value1')
    expect(result).to.have.property('prop2', 'def2')
  })

  it('When default are applied, the result object is the expected one', () => {
    type MyType = { prop1: string; prop2: string }
    const object: Partial<MyType> = { prop1: 'value1' }
    const defaults: Partial<MyType> = { prop2: 'def2' }

    const result = applySomeDefaults(defaults, object)

    expect(result).to.have.property('prop1', 'value1')
    expect(result).to.have.property('prop2', 'def2')
  })

  it('When execution fails, then retries are executed', async () => {
    let allFailed = false
    let retries = 0

    const result = await retry(
      () => {
        if (retries == 0) {
          return Promise.reject('Fail')
        } else {
          return Promise.resolve('result')
        }
      },
      2,
      '10',
      () => retries++,
      () => (allFailed = true)
    )

    expect(allFailed).to.be.false
    expect(retries).to.equal(1)
    expect(result).to.equal('result')
  })

  it('When all attempts fails, then an error is thrown', async () => {
    let allFailed = false
    let retries = 0

    const result = retry(
      () => Promise.reject('Error message'),
      3,
      '10',
      () => retries++,
      () => (allFailed = true)
    )

    await expect(result).to.rejectedWith('Error message')
    expect(allFailed).to.be.true
    expect(retries).to.equal(2)
  })
})
