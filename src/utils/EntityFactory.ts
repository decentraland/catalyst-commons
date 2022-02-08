import { hashV1 } from '@dcl/hashing'
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
  /** @deprecated version is nolonger required since ADR51 */
  version?: EntityVersion
  type: EntityType
  pointers: Pointer[]
  timestamp: Timestamp
  content?: EntityContentItemReference[]
  metadata?: EntityMetadata
}): Promise<{ entity: Entity; entityFile: Uint8Array }> {
  // Make sure that there is at least one pointer
  if (pointers.length === 0) throw new Error(`All entities must have at least one pointer.`)

  if (version === EntityVersion.V2) throw new Error(`V2 is not supported.`)

  const entity = {
    // default version is V3
    version: version || EntityVersion.V3,
    type,
    pointers,
    timestamp,
    content,
    metadata
  }

  // prevent duplicated file names
  if (content) {
    const usedFilenames = new Set<string>()
    for (let a of content) {
      const lowerCasedFileName = a.file.toLowerCase()
      if (usedFilenames.has(lowerCasedFileName)) {
        throw new Error(
          `Error creating the deployable entity: Decentraland's file system is case insensitive, the file ${JSON.stringify(
            a.file
          )} is repeated`
        )
      }
      usedFilenames.add(lowerCasedFileName)
    }
  }

  const entityFile = new TextEncoder().encode(JSON.stringify(entity))

  const entityId: EntityId = await hashV1(entityFile)
  const entityWithId: Entity = {
    id: entityId,
    ...entity
  }

  return { entity: entityWithId, entityFile }
}
