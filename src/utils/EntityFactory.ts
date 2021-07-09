import { EntityType, Pointer, Timestamp, EntityMetadata, Entity, EntityContentItemReference, EntityId } from '../types'
import { Hashing } from './Hashing'

/**
 * Take all the entity's data, build the entity file with it, and calculate its id
 */
export async function buildEntityAndFile(
  type: EntityType,
  pointers: Pointer[],
  timestamp: Timestamp,
  content?: EntityContentItemReference[],
  metadata?: EntityMetadata
): Promise<{ entity: Entity; entityFile: Buffer }> {
  // Make sure that there is at least one pointer
  if (pointers.length === 0) {
    throw new Error(`All entities must have at least one pointer.`)
  }

  const entity = {
    type,
    pointers,
    timestamp,
    content,
    metadata
  }

  const entityFile = Buffer.from(JSON.stringify(entity))
  const entityId: EntityId = await Hashing.calculateBufferHash(entityFile)
  const entityWithId: Entity = {
    id: entityId,
    ...entity
  }

  return { entity: entityWithId, entityFile }
}
