import { entityParameters } from './entities'
import { EntityType } from 'types'

export const validateMetadata = (entityType: EntityType, metadata: any): boolean => {
  const { validate } = entityParameters[entityType]
  if (!validate) {
    throw new Error(`Unknown entity type: ${entityType}`)
  }
  return validate(metadata)
}

export const validateSize = (entityType: EntityType, currentSize: number): boolean => {
  const { maxSizeInMB } = entityParameters[entityType]
  if (!maxSizeInMB) {
    throw new Error(`Unknown entity type: ${entityType}`)
  }
  return currentSize <= maxSizeInMB
}
