import { EthAddress } from '@dcl/schemas'
import RequestManager, {
  BigNumber,
  bytesToHex,
  ContractFactory
} from 'eth-connect'
import { retry } from './Helper'
import {
  daoCatalystDeployments,
  catalystAbiItems
} from '../contracts/CatalystAbi'

type CatalystByIdResult = {
  id: Uint8Array
  owner: string
  domain: string
}

/** Returns the catalyst list for a specified Ethereum Provider. */
export async function getCatalystFromProvider(
  etherumProvider: any
): Promise<ServerMetadata[]> {
  const requestManager = new RequestManager(etherumProvider)

  const networkId = (await requestManager.net_version()).toString()

  if (!(networkId in daoCatalystDeployments))
    throw new Error(
      `The networkId=${networkId} doesn't have a deployed Catalyst Registry contract`
    )

  const contractAddress = daoCatalystDeployments[networkId]

  const contract: {
    catalystCount(): Promise<BigNumber>
    catalystIds(input: string | number): Promise<Uint8Array>
    catalystById(id: Uint8Array): Promise<CatalystByIdResult>
  } = (await new ContractFactory(requestManager, catalystAbiItems).at(
    contractAddress
  )) as any

  const count = (
    await retry(() => contract.catalystCount(), 5, '0.1s')
  ).toNumber()
  const nodes: ServerMetadata[] = []
  // Create an array with values from 0 to count - 1
  const indices = new Array(count).fill(0).map((_, i) => i)

  const dataPromises = indices.map((index) =>
    retry(
      () => contract.catalystIds(index).then((id) => contract.catalystById(id)),
      5,
      '0.1s'
    )
  )

  const data = await Promise.all(dataPromises)

  for (const node of data) {
    if (node.domain.startsWith('http://')) {
      console.warn(
        `Catalyst node domain using http protocol, skipping ${JSON.stringify(
          node
        )}`
      )
      continue
    }

    if (!node.domain.startsWith('https://')) {
      node.domain = 'https://' + node.domain
    }

    // trim url in case it starts/ends with a blank
    node.domain = node.domain.trim()

    nodes.push({
      ...node,
      address: node.domain,
      id: '0x' + bytesToHex(node.id),
      original: node
    })
  }
  return nodes
}

/** @deprecated stop using this type */
export type ServerMetadata = {
  /** @deprecated use domain instead */
  address: string
  domain: string
  owner: EthAddress
  id: string
  original: any
}
