import { CatalystData, DAOContract } from '../contracts/CatalystContract'
import { EthAddress } from 'dcl-crypto'
import { EthNetwork } from '../contracts/utils'

export function getMainnetCatalysts(): Promise<ServerMetadata[]> {
  return getServersFromNetwork('mainnet')
}

export function getRopstenCatalysts(): Promise<ServerMetadata[]> {
  return getServersFromNetwork('ropsten')
}

async function getServersFromNetwork(network: EthNetwork): Promise<ServerMetadata[]> {
  const contract = DAOContract.withNetwork(network)

  // Check count on the list
  const count = await contract.getCount()

  // Create an array with values from 0 to count - 1
  const indices = new Array(count).fill(0).map((_, i) => i)

  // Fetch data from the contract
  const dataPromises: Promise<CatalystData>[] = indices.map((index) =>
    contract.getCatalystIdByIndex(index).then((id) => contract.getServerData(id))
  )
  const data = await Promise.all(dataPromises)

  // Map and return
  return data.map(toMetadata).filter((metadata): metadata is ServerMetadata => !!metadata)
}

/**
 * Converts the data from the contract into something more useful.
 * Returns undefined if the data from the contract is invalid.
 */
function toMetadata(data: CatalystData): ServerMetadata | undefined {
  const { id, owner, domain } = data

  let address = domain.trim()

  if (address.startsWith('http://')) {
    console.warn(`Catalyst node domain using http protocol, skipping ${address}`)
    return undefined
  }

  if (!address.startsWith('https://')) {
    address = 'https://' + address
  }

  return { address, owner, id }
}

export type ServerMetadata = {
  address: string
  owner: EthAddress
  id: string
}
