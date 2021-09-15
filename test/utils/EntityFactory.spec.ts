import chai from 'chai'
import chaiAsPromised from 'chai-as-promised'
import { EntityType, EntityVersion } from '../../src'
import { Hashing } from '../../src/utils'
import { buildEntityAndFile } from '../../src/utils/EntityFactory'

chai.use(chaiAsPromised)
const expect = chai.expect

describe('EntityFactory', () => {
  it('When an entity is built with no pointers, then an exception is thrown', async () => {
    await expect(
      buildEntityAndFile({ version: EntityVersion.V3, type: EntityType.PROFILE, pointers: [], timestamp: 20 })
    ).to.be.rejectedWith(`All entities must have at least one pointer.`)
  })

  it('When a v2 entity is built, then an exception is thrown', async () => {
    await expect(
      buildEntityAndFile({ version: EntityVersion.V2, type: EntityType.PROFILE, pointers: ['P1'], timestamp: 20 })
    ).to.be.rejectedWith(`V2 is not supported.`)
  })

  it('When a v3 entity is built, the non-ipfs hash is used', async () => {
    const { entity, entityFile } = await buildEntityAndFile({
      version: EntityVersion.V3,
      type: EntityType.PROFILE,
      pointers: ['P1'],
      timestamp: 20
    })

    expect(entity.id).to.equal(await Hashing.calculateBufferHash(entityFile))
  })

  it('When a v4 entity is built, the ipfs hash is used', async () => {
    const { entity, entityFile } = await buildEntityAndFile({
      version: EntityVersion.V4,
      type: EntityType.PROFILE,
      pointers: ['P1'],
      timestamp: 20
    })

    expect(entity.id).to.equal(await Hashing.calculateIPFSHash(entityFile))
  })
})
