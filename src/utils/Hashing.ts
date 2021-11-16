import CID from 'cids'
import multihashing from 'multihashing-async'
import ipfsHashing from 'ipfs-only-hash'
import { ContentFileHash, EntityContentItemReference, EntityMetadata } from '../types'

export namespace Hashing {
  /**
   * Given a set of files, return a map with their hash
   * @deprecated use calculateIPFSHashes instead
   */
  export async function calculateHashes<T extends Uint8Array>(
    files: T[]
  ): Promise<{ hash: ContentFileHash; file: T }[]> {
    const entries = Array.from(files).map(async (file) => ({
      hash: await calculateBufferHash(file),
      file
    }))
    return Promise.all(entries)
  }

  /**
   * Return the given buffer's hash
   * @deprecated use calculateIPFSHash instead
   */
  export async function calculateBufferHash(buffer: Uint8Array): Promise<ContentFileHash> {
    const hash = await multihashing(buffer, 'sha2-256')
    return new CID(0, 'dag-pb', hash).toBaseEncodedString()
  }

  export async function calculateIPFSHash(buffer: Uint8Array): Promise<ContentFileHash> {
    // CIDv1 requires rawLeaves: true
    return ipfsHashing.of(buffer, { cidVersion: 1, onlyHash: true, rawLeaves: true })
  }

  export async function calculateIPFSHashes<T extends Uint8Array>(
    files: T[]
  ): Promise<{ hash: ContentFileHash; file: T }[]> {
    const entries = Array.from(files).map(async (file) => ({
      hash: await calculateIPFSHash(file),
      file
    }))
    return Promise.all(entries)
  }

  function prepareADR32Data(contents: EntityContentItemReference[], metadata?: EntityMetadata) {
    // Compare both by key and hash
    const sorter = (a: EntityContentItemReference, b: EntityContentItemReference) => {
      if (a.hash > b.hash) return 1
      else if (a.hash < b.hash) return -1
      else return a.file > b.file ? 1 : -1
    }

    return new TextEncoder().encode(
      JSON.stringify({
        content: contents.sort(sorter).map((entry) => ({ key: entry.file, hash: entry.hash })),
        metadata
      })
    )
  }

  /**
   * Calculates the content hash of multiple files to be used consistently by the builder
   * and other content-based applications when hashes need to be stored on-chain.
   *
   * Returns the CIDv1 of the data prepared to sign
   */
  export async function calculateMultipleHashesADR32(
    contents: EntityContentItemReference[],
    metadata?: EntityMetadata
  ) {
    const data = prepareADR32Data(contents, metadata)

    return {
      data,
      hash: await Hashing.calculateIPFSHash(data)
    }
  }

  /**
   * Calculates the content hash of multiple files to be used consistently by the builder
   * and other content-based applications when hashes need to be stored on-chain.
   * @deprecated this is maintained only for compatibility reasons with calculateBufferHash (Qm prefix)
   */
  export async function calculateMultipleHashesADR32LegacyQmHash(
    contents: EntityContentItemReference[],
    metadata?: EntityMetadata
  ) {
    const data = prepareADR32Data(contents, metadata)

    return {
      data,
      hash: await Hashing.calculateBufferHash(data)
    }
  }
}
