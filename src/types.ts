import { AuthChain, EthAddress } from '@dcl/schemas'

/** @deprecated */
export type ContentFileHash = string
/** @deprecated */
export type Timestamp = number
/** @deprecated */
export type EntityId = ContentFileHash
/** @deprecated */
export type Pointer = string
/** @deprecated */
export type EntityMetadata = any

export type EntityContentItemReference = {
  file: string
  hash: ContentFileHash
}

/** @deprecated use the type from @dcl/schemas */
export enum EntityType {
  SCENE = 'scene',
  PROFILE = 'profile',
  WEARABLE = 'wearable',
  STORE = 'store'
}

/** @deprecated use the type from @dcl/schemas */
export type Entity = {
  version: EntityVersion
  id: EntityId
  type: EntityType
  pointers: Pointer[]
  timestamp: Timestamp
  content?: EntityContentItemReference[]
  metadata?: EntityMetadata
}

/** @deprecated use the type from @dcl/schemas */
export type ServerName = string
/** @deprecated use the type from @dcl/schemas */
export type ServerAddress = string

/** @deprecated use the type from @dcl/schemas */
export type ServerStatus = {
  name: ServerName
  version: EntityVersion
  currentTime: Timestamp
  lastImmutableTime: Timestamp
  historySize: number
}

/** @deprecated use the type from @dcl/schemas */
export enum EntityVersion {
  V2 = 'v2',
  V3 = 'v3',
  V4 = 'v4'
}

export type AvailableContentResult = {
  cid: ContentFileHash
  available: boolean
}[]

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
  entityVersion: EntityVersion
  entityType: EntityType
  entityId: EntityId
  entityTimestamp: Timestamp
  deployedBy: EthAddress
}
export type DeploymentWithPointers = DeploymentBase & { pointers: Pointer[] }
export type DeploymentWithContent = DeploymentBase & {
  content?: DeploymentContent[]
}
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
  isDenylisted?: boolean
  denylistedContent?: ContentFileHash[]
}

export type Profile = EntityMetadata

export enum HealthStatus {
  HEALTHY = 'Healthy',
  UNHEALTHY = 'Unhealthy',
  DOWN = 'Down'
}
