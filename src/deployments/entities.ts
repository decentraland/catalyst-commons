import { Profile, Scene, Store, ValidateFunction, Wearable } from '@dcl/schemas'
import { EntityType } from 'types'

type AcceptedEntityType = Scene | Profile | Wearable | Store

type Params = {
  validate: ValidateFunction<AcceptedEntityType>
  maxSize: number // in MB
}

type EntityParams = Record<EntityType, Params>

export const entityParameters: EntityParams = {
  scene: {
    validate: Scene.validate,
    maxSize: 15
  },
  profile: {
    validate: Profile.validate,
    maxSize: 15
  },
  wearable: {
    validate: Wearable.validate,
    maxSize: 3
  },
  store: {
    validate: Store.validate,
    maxSize: 1
  }
}
