import * as hashing from '@dcl/hashing'
import { ContentFileHash } from '../types'

export namespace Hashing {
  /**
   * Given a set of files, return a map with their hash
   * @deprecated use calculateIPFSHashes instead. This function only exists for compatibility reasons
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
   * @deprecated use calculateIPFSHash instead. This function only exists for compatibility reasons
   */
  export async function calculateBufferHash(buffer: Uint8Array): Promise<ContentFileHash> {
    return hashing.hashV0(buffer)
  }

  /**
   * @deprecated use `import {hashV1} from '@dcl/hashing'` instead
   */
  export async function calculateIPFSHash(buffer: Uint8Array): Promise<ContentFileHash> {
    return hashing.hashV1(buffer)
  }

  export async function calculateIPFSHashes<T extends Uint8Array>(
    files: T[]
  ): Promise<{ hash: ContentFileHash; file: T }[]> {
    const entries = Array.from(files).map(async (file) => ({
      hash: await hashing.hashV1(file),
      file
    }))
    return Promise.all(entries)
  }

  /**
   * Calculates the content hash of multiple files to be used consistently by the builder
   * and other content-based applications when hashes need to be stored on-chain.
   *
   * Returns the CIDv1 of the data prepared to sign
   *
   * @deprecated use `import {calculateMultipleHashesADR32} from '@dcl/hashing'` instead
   */
  export const calculateMultipleHashesADR32 = hashing.calculateMultipleHashesADR32

  /**
   * Calculates the content hash of multiple files to be used consistently by the builder
   * and other content-based applications when hashes need to be stored on-chain.
   * @deprecated this is maintained only for compatibility reasons with calculateBufferHash (Qm prefix)
   */
  export const calculateMultipleHashesADR32LegacyQmHash = hashing.calculateMultipleHashesADR32LegacyQmHash
}
