import { Avatar } from '@dcl/schemas'
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

    expect(entity.id).to.equal('QmUks92WKitaRZ6WrZ72JiFkALwhvSfJyQUsjVyjgP2PQh')
    expect(entity.id).to.equal(await Hashing.calculateBufferHash(entityFile))
  })

  it('When a v4 entity is built, the ipfs hash is used', async () => {
    const avatarInfo = {
      bodyShape: 'urn:decentraland:off-chain:base-avatars:BaseMale',
      snapshots: {
        face256: 'bafybeiasb5vpmaounyilfuxbd3lryvosl4yefqrfahsb2esg46q6tu6y5s',
        body: 'bafybeiasb5vpmaounyilfuxbd3lryvosl4yefqrfahsb2esg46q6tu6y5t'
      },
      eyes: { color: { r: 0.23046875, g: 0.625, b: 0.3125 } },
      hair: { color: { r: 0.35546875, g: 0.19140625, b: 0.05859375 } },
      skin: { color: { r: 0.94921875, g: 0.76171875, b: 0.6484375 } },
      wearables: ['urn:decentraland:off-chain:base-avatars:tall_front_01']
    }

    const avatar: Avatar = {
      userId: '0x87956abc4078a0cc3b89b419628b857b8af826ed',
      email: 'some@email.com',
      name: 'Some Name',
      hasClaimedName: true,
      description: 'Some Description',
      ethAddress: '0x87956abC4078a0Cc3b89b419628b857B8AF826Ed',
      version: 44,
      avatar: avatarInfo,
      tutorialStep: 355,
      interests: []
    }

    const { entity, entityFile } = await buildEntityAndFile({
      version: EntityVersion.V4,
      type: EntityType.PROFILE,
      pointers: ['P1'],
      timestamp: 20,
      metadata: {
        avatars: [avatar]
      }
    })

    expect(entity.id).to.equal('bafkreiawpk2gvgkxgvqwh5vwzh4yibcou5rfg3ddem3e4jl4mkgftq5ava')
    expect(entity.id).to.equal(await Hashing.calculateIPFSHash(entityFile))
  })
})
