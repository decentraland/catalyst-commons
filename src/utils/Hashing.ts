import CID from 'cids'
import multihashing from 'multihashing-async'
import ipfsHashing from 'ipfs-only-hash'
import { ContentFileHash } from '../types'

export class Hashing {
  /**
   * Given a set of files, return a map with their hash
   * @deprecated use calculateIPFSHashes instead
   */
  static async calculateHashes<T extends Uint8Array>(files: T[]): Promise<{ hash: ContentFileHash; file: T }[]> {
    const entries = Array.from(files).map(async (file) => ({
      hash: await this.calculateBufferHash(file),
      file
    }))
    return Promise.all(entries)
  }

  /**
   * Return the given buffer's hash
   * @deprecated use calculateIPFSHash instead
   */
  static async calculateBufferHash(buffer: Uint8Array): Promise<ContentFileHash> {
    const hash = await multihashing(buffer, 'sha2-256')
    return new CID(0, 'dag-pb', hash).toBaseEncodedString()
  }

  static async calculateIPFSHash(buffer: Uint8Array): Promise<ContentFileHash> {
    // CIDv1 requires rawLeaves: true
    return ipfsHashing.of(buffer, { cidVersion: 1, onlyHash: true, rawLeaves: true })
  }

  static async calculateIPFSHashes<T extends Uint8Array>(files: T[]): Promise<{ hash: ContentFileHash; file: T }[]> {
    const entries = Array.from(files).map(async (file) => ({
      hash: await this.calculateIPFSHash(file),
      file
    }))
    return Promise.all(entries)
  }
}
