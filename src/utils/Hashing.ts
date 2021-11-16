import CID from 'cids'
import multihashing from 'multihashing-async'
import ipfsHashing from 'ipfs-only-hash'
import { ContentFileHash } from '../types'

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

  /**
   * Calculates the content hash of multiple files to be used consistently by the builder
   * and other content-based applications when hashes need to be stored on-chain.
   *
   * Receives a Map<FileName,Hash> + metadata?
   */
  export async function calculateMultipleHashesADR32(content?: Map<string, string>, metadata?: any) {
    type KH = { key: string; hash: string }

    // Compare both by key and hash
    const compare = (a: KH, b: KH) => {
      if (a.hash > b.hash) return 1
      else if (a.hash < b.hash) return -1
      else return a.key > b.key ? 1 : -1
    }

    const entries = Array.from(content?.entries() ?? [])
    const contentAsJson = entries.map(([key, hash]) => ({ key, hash })).sort(compare)

    const buffer = new TextEncoder().encode(JSON.stringify({ content: contentAsJson, metadata }))

    return {
      buffer,
      hash: await Hashing.calculateIPFSHash(buffer)
    }
  }
}
