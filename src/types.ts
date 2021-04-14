import { AuthChain, EthAddress } from 'dcl-crypto'

export type ContentFileHash = string
export type Timestamp = number
export type EntityId = ContentFileHash
export type Pointer = string
export type EntityMetadata = any

export type EntityContentItemReference = {
  file: string
  hash: ContentFileHash
}

export enum EntityType {
  SCENE = 'scene',
  PROFILE = 'profile',
  WEARABLE = 'wearable'
}

export type Entity = {
  id: EntityId
  type: EntityType
  pointers: Pointer[]
  timestamp: Timestamp
  content?: EntityContentItemReference[]
  metadata?: EntityMetadata
}

export type ContentFile = {
  name: string
  content: Buffer
}

export type ServerVersion = string
export type ServerName = string
export type ServerAddress = string

export type ServerStatus = {
  name: ServerName
  version: ServerVersion
  currentTime: Timestamp
  lastImmutableTime: Timestamp
  historySize: number
}

export enum EntityVersion {
  V2 = 'v2',
  V3 = 'v3'
}

export type AvailableContentResult = { cid: ContentFileHash; available: boolean }[]

export type PartialDeploymentHistory<T extends DeploymentBase> = {
  deployments: T[]
  filters: DeploymentFilters
  pagination: {
    offset: number
    limit: number
    moreData: boolean
    next?: string
    lastId?: string
  }
}

export type DeploymentFilters = {
  from?: Timestamp
  to?: Timestamp
  deployedBy?: EthAddress[]
  entityTypes?: EntityType[]
  entityIds?: EntityId[]
  pointers?: Pointer[]
  onlyCurrentlyPointed?: boolean
}

export type DeploymentSorting = {
  field?: SortingField
  order?: SortingOrder
}

export enum SortingField {
  LOCAL_TIMESTAMP = 'local_timestamp',
  ENTITY_TIMESTAMP = 'entity_timestamp'
}

export enum SortingOrder {
  ASCENDING = 'ASC',
  DESCENDING = 'DESC'
}

export type Deployment = DeploymentBase &
  DeploymentWithPointers &
  DeploymentWithContent &
  DeploymentWithMetadata &
  DeploymentWithAuditInfo

export type DeploymentBase = {
  entityType: EntityType
  entityId: EntityId
  entityTimestamp: Timestamp
  deployedBy: EthAddress
}
export type DeploymentWithPointers = DeploymentBase & { pointers: Pointer[] }
export type DeploymentWithContent = DeploymentBase & { content?: DeploymentContent[] }
export type DeploymentWithMetadata = DeploymentBase & { metadata?: any }
export type DeploymentWithAuditInfo = DeploymentBase & { auditInfo: AuditInfo }

export type DeploymentContent = {
  key: string
  hash: string
}

export type AuditInfo = {
  version: EntityVersion
  authChain: AuthChain
  localTimestamp: Timestamp
  overwrittenBy?: EntityId
  migrationData?: any
  isDenylisted?: boolean
  denylistedContent?: ContentFileHash[]
}

export type Profile = EntityMetadata

export type LegacyAuditInfo = {
  version: EntityVersion
  deployedTimestamp: Timestamp
  authChain: AuthChain
  overwrittenBy?: EntityId
  isDenylisted?: boolean
  denylistedContent?: ContentFileHash[]
  originalMetadata?: {
    // This is used for migrations
    originalVersion: EntityVersion
    data: any
  }
}
