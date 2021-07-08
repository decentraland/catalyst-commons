import CID from 'cids'
import multihashing from 'multihashing-async'
import { ContentFileHash } from '../types'

export class Hashing {
  /** Given a set of files, return a map with their hash */
  static async calculateHashes(files: Buffer[]): Promise<{ hash: ContentFileHash; file: Buffer }[]> {
    const entries = Array.from(files).map<Promise<{ hash: ContentFileHash; file: Buffer }>>(async (file) => ({
      hash: await this.calculateBufferHash(file),
      file
    }))
    return Promise.all(entries)
  }

  /** Return the given buffer's hash */
  static async calculateBufferHash(buffer: Buffer): Promise<ContentFileHash> {
    const hash = await multihashing(buffer, 'sha2-256')
    return new CID(0, 'dag-pb', hash).toBaseEncodedString()
  }
}
