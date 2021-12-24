import { Profile, Scene, Store, ValidateFunction, Wearable } from '@dcl/schemas'
import { EntityType } from '../types'

type AcceptedEntityType = Scene | Profile | Wearable | Store

type Params = {
  validate: ValidateFunction<AcceptedEntityType>
  maxSizeInMB: number // in MB
}

type EntityParams = Record<EntityType, Params>

export const entityParameters: EntityParams = {
  scene: {
    validate: Scene.validate,
    maxSizeInMB: 15
  },
  profile: {
    validate: Profile.validate,
    maxSizeInMB: 15
  },
  wearable: {
    validate: Wearable.validate,
    maxSizeInMB: 3
  },
  store: {
    validate: Store.validate,
    maxSizeInMB: 1
  }
}
