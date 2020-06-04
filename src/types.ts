
import { AuthChain, EthAddress } from 'dcl-crypto'

export type ContentFileHash = string
export type Timestamp = number
export type EntityId = ContentFileHash
export type Pointer = string
export type EntityMetadata = any

export type EntityContentItemReference = {
    file: string,
    hash: ContentFileHash,
}

export enum EntityType {
    SCENE = "scene",
    PROFILE = "profile",
}

export type Entity = {
    id: EntityId,
    type: EntityType,
    pointers: Pointer[],
    timestamp: Timestamp,
    content?: EntityContentItemReference[],
    metadata?: EntityMetadata,
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

export type EntityVersion = string

export type AvailableContentResult = { cid: ContentFileHash, available: boolean }[]

export type PartialDeploymentHistory = {
    deployments: Deployment[],
    filters: DeploymentFilters,
    pagination: {
        offset: number,
        limit: number,
        moreData: boolean,
    },
}

export type DeploymentFilters = {
    fromLocalTimestamp?: Timestamp,
    toLocalTimestamp?: Timestamp,
    deployedBy?: EthAddress[],
    entityTypes?: EntityType[],
    entityIds?: EntityId[],
    pointers?: Pointer[],
    onlyCurrentlyPointed?: boolean,
}

export type Deployment = {
    entityType: EntityType,
    entityId: EntityId,
    pointers: Pointer[],
    entityTimestamp: Timestamp,
    content?: Map<string, ContentFileHash>,
    metadata?: any,
    deployedBy: EthAddress,
    auditInfo: AuditInfo,
}

export type AuditInfo = {
    version: EntityVersion,
    authChain: AuthChain,
    originServerUrl: ServerAddress,
    originTimestamp: Timestamp,
    localTimestamp: Timestamp,
    overwrittenBy?: EntityId,
    migrationData?: any,
    isDenylisted?: boolean,
    denylistedContent?: ContentFileHash[],
}

export type LegacyAuditInfo = {
    version: EntityVersion,
    deployedTimestamp: Timestamp
    authChain: AuthChain,
    overwrittenBy?: EntityId,
    isDenylisted?: boolean,
    denylistedContent?: ContentFileHash[],
    originalMetadata?: { // This is used for migrations
        originalVersion: EntityVersion,
        data: any,
    },
}

export type Profile = EntityMetadata

export type LegacyDeploymentEvent = {
    /** The server where the user uploaded the entity */
    serverName: ServerName,
    entityType: EntityType,
    entityId: EntityId,
    /** The moment when the server validated and stored the entity */
    timestamp: Timestamp,
}

export type LegacyDeploymentHistory = LegacyDeploymentEvent[]

export type LegacyPartialDeploymentHistory = {
    events: LegacyDeploymentEvent[],
    filters: {
        from?: Timestamp,
        to?: Timestamp,
        serverName?: ServerName,
    },
    pagination: {
        offset: number,
        limit: number,
        moreData: boolean,
    },
}