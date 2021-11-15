import {
  EntityType,
  Pointer,
  Timestamp,
  EntityMetadata,
  Entity,
  EntityContentItemReference,
  EntityId,
  EntityVersion
} from '../types'
import { Hashing } from './Hashing'

/**
 * Take all the entity's data, build the entity file with it, and calculate its id
 */
export async function buildEntityAndFile({
  version,
  type,
  pointers,
  timestamp,
  content,
  metadata
}: {
  version: EntityVersion
  type: EntityType
  pointers: Pointer[]
  timestamp: Timestamp
  content?: EntityContentItemReference[]
  metadata?: EntityMetadata
}): Promise<{ entity: Entity; entityFile: Uint8Array }> {
  // Make sure that there is at least one pointer
  if (pointers.length === 0) {
    throw new Error(`All entities must have at least one pointer.`)
  }

  if (version === EntityVersion.V2) {
    throw new Error(`V2 is not supported.`)
  }

  const entity = {
    version,
    type,
    pointers,
    timestamp,
    content,
    metadata
  }

  const entityFile = new TextEncoder().encode(JSON.stringify(entity))
  const entityId: EntityId =
    version === EntityVersion.V3
      ? await Hashing.calculateBufferHash(entityFile)
      : await Hashing.calculateIPFSHash(entityFile)
  const entityWithId: Entity = {
    id: entityId,
    ...entity
  }

  return { entity: entityWithId, entityFile }
}
