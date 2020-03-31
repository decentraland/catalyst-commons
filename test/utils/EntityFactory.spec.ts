import chai from 'chai'
import chaiAsPromised from 'chai-as-promised'
import { EntityType } from 'types'
import { buildEntityAndFile } from 'utils/EntityFactory'

chai.use(chaiAsPromised)
const expect = chai.expect

describe('EntityFactory', () => {

    it('When an entity is built with no pointers, then an exception is thrown', () => {
        expect(buildEntityAndFile(EntityType.PROFILE, [], 20)).to.be.rejectedWith(`All entities must have at least one pointer.`)
    })

})