import { EthAddress } from '@dcl/schemas'
import RequestManager, { BigNumber, bytesToHex, ContractFactory } from 'eth-connect'
import { retry } from './Helper'
import { daoCatalystDeployments, catalystAbiItems } from '../contracts/CatalystAbi'

type CatalystByIdResult = {
  id: Uint8Array
  owner: string
  domain: string
}

/** Returns the catalyst list for a specified Ethereum Provider. */
export async function getCatalystFromProvider(etherumProvider: any): Promise<ServerMetadata[]> {
  const requestManager = new RequestManager(etherumProvider)

  const networkId = (await requestManager.net_version()).toString()

  if (!(networkId in daoCatalystDeployments))
    throw new Error(`The networkId=${networkId} doesn't have a deployed Catalyst Registry contract`)

  const contractAddress = daoCatalystDeployments[networkId]

  const contract2: {
    catalystCount(): Promise<BigNumber>
    catalystIds(input: string | number): Promise<Uint8Array>
    catalystById(id: Uint8Array): Promise<CatalystByIdResult>
  } = (await new ContractFactory(requestManager, catalystAbiItems).at(contractAddress)) as any

  const count = (await retry(() => contract2.catalystCount(), 5, '0.1s')).toNumber()
  const nodes: ServerMetadata[] = []

  for (let i = 0; i < count; ++i) {
    const id = await retry(() => contract2.catalystIds(i), 5, '0.1s')
    const node = await retry(() => contract2.catalystById(id), 5, '0.1s')

    if (node.domain.startsWith('http://')) {
      console.warn(`Catalyst node domain using http protocol, skipping ${JSON.stringify(node)}`)
      continue
    }

    if (!node.domain.startsWith('https://')) {
      node.domain = 'https://' + node.domain
    }

    // trim url in case it starts/ends with a blank
    node.domain = node.domain.trim()

    nodes.push({ ...node, address: node.domain, id: '0x' + bytesToHex(id), original: node })
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
