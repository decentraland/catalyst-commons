import BN from 'bn.js'
import { Address } from 'web3x/address'
import { Contract, ContractOptions, EventSubscriptionFactory, TxCall, TxSend } from 'web3x/contract'
import { Eth } from 'web3x/eth'
import { EventLog, TransactionReceipt } from 'web3x/formatters'
import abi from './CatalystAbi'
export type AddCatalystEvent = {
  _id: string
  _owner: Address
  _domain: string
}
export type RemoveCatalystEvent = {
  _id: string
  _owner: Address
  _domain: string
}
export type ScriptResultEvent = {
  executor: Address
  script: string
  input: string
  returnData: string
}
export type RecoverToVaultEvent = {
  vault: Address
  token: Address
  amount: string
}
export type AddCatalystEventLog = EventLog<AddCatalystEvent, 'AddCatalyst'>
export type RemoveCatalystEventLog = EventLog<RemoveCatalystEvent, 'RemoveCatalyst'>
export type ScriptResultEventLog = EventLog<ScriptResultEvent, 'ScriptResult'>
export type RecoverToVaultEventLog = EventLog<RecoverToVaultEvent, 'RecoverToVault'>
interface CatalystEvents {
  AddCatalyst: EventSubscriptionFactory<AddCatalystEventLog>
  RemoveCatalyst: EventSubscriptionFactory<RemoveCatalystEventLog>
  ScriptResult: EventSubscriptionFactory<ScriptResultEventLog>
  RecoverToVault: EventSubscriptionFactory<RecoverToVaultEventLog>
}
interface CatalystEventLogs {
  AddCatalyst: AddCatalystEventLog
  RemoveCatalyst: RemoveCatalystEventLog
  ScriptResult: ScriptResultEventLog
  RecoverToVault: RecoverToVaultEventLog
}
interface CatalystTxEventLogs {
  AddCatalyst: AddCatalystEventLog[]
  RemoveCatalyst: RemoveCatalystEventLog[]
  ScriptResult: ScriptResultEventLog[]
  RecoverToVault: RecoverToVaultEventLog[]
}
export type CatalystTransactionReceipt = TransactionReceipt<CatalystTxEventLogs>
interface CatalystMethods {
  owners(a0: Address): TxCall<boolean>
  hasInitialized(): TxCall<boolean>
  catalystCount(): TxCall<string>
  getEVMScriptExecutor(_script: string): TxCall<Address>
  getRecoveryVault(): TxCall<Address>
  catalystIndexById(a0: string): TxCall<string>
  catalystOwner(_id: string): TxCall<Address>
  catalystDomain(_id: string): TxCall<string>
  catalystIds(a0: number | string | BN): TxCall<string>
  allowRecoverability(token: Address): TxCall<boolean>
  appId(): TxCall<string>
  initialize(): TxSend<CatalystTransactionReceipt>
  getInitializationBlock(): TxCall<string>
  transferToVault(_token: Address): TxSend<CatalystTransactionReceipt>
  canPerform(_sender: Address, _role: string, _params: (number | string | BN)[]): TxCall<boolean>
  getEVMScriptRegistry(): TxCall<Address>
  removeCatalyst(_id: string): TxSend<CatalystTransactionReceipt>
  domains(a0: string): TxCall<boolean>
  catalystById(
    a0: string
  ): TxCall<{
    id: string
    0: string
    owner: Address
    1: Address
    domain: string
    2: string
    startTime: string
    3: string
    endTime: string
    4: string
  }>
  addCatalyst(_owner: Address, _domain: string): TxSend<CatalystTransactionReceipt>
  kernel(): TxCall<Address>
  MODIFY_ROLE(): TxCall<string>
  isPetrified(): TxCall<boolean>
}
export interface CatalystDefinition {
  methods: CatalystMethods
  events: CatalystEvents
  eventLogs: CatalystEventLogs
}
export class Catalyst extends Contract<CatalystDefinition> {
  constructor(eth: Eth, address?: Address, options?: ContractOptions) {
    super(eth, abi, address, options)
  }
  deploy(): TxSend<CatalystTransactionReceipt> {
    return super.deployBytecode(
      '0x6080604052620000176401000000006200001d810204565b6200023b565b6200003064010000000062000125810204565b60408051808201909152601881527f494e49545f414c52454144595f494e495449414c495a45440000000000000000602082015290156200010c576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825283818151815260200191508051906020019080838360005b83811015620000d0578181015183820152602001620000b6565b50505050905090810190601f168015620000fe5780820380516001836020036101000a031916815260200191505b509250505060405180910390fd5b506200012360001964010000000062000154810204565b565b60006200014f6000805160206200265683398151915264010000000062001fa96200023382021704565b905090565b6200016764010000000062000125810204565b60408051808201909152601881527f494e49545f414c52454144595f494e495449414c495a454400000000000000006020820152901562000206576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252838181518152602001915080519060200190808383600083811015620000d0578181015183820152602001620000b6565b50620002306000805160206200265683398151915282640100000000620022a36200023782021704565b50565b5490565b9055565b61240b806200024b6000396000f3006080604052600436106101325763ffffffff7c0100000000000000000000000000000000000000000000000000000000600035041663022914a781146101375780630803fac01461017957806318becc101461018e5780632914b9bd146101b557806332f0a3b51461023757806340190c651461024c5780635c0bd710146102645780636bf19e2a1461027c5780637b9b4f2c146103095780637e7db6e11461032157806380afdea81461034f5780638129fc1c146103645780638b3dd7491461037b5780639d4941d814610390578063a1658fad146103be578063a479e50814610432578063ba2d7af914610447578063c722f1771461045f578063c9038ce914610477578063d027023b14610557578063d4aae0c414610591578063d970565b146105a6578063de4796ed146105bb575b600080fd5b34801561014357600080fd5b5061016573ffffffffffffffffffffffffffffffffffffffff600435166105d0565b604080519115158252519081900360200190f35b34801561018557600080fd5b506101656105e5565b34801561019a57600080fd5b506101a361060f565b60408051918252519081900360200190f35b3480156101c157600080fd5b506040805160206004803580820135601f810184900484028501840190955284845261020e9436949293602493928401919081908401838280828437509497506106169650505050505050565b6040805173ffffffffffffffffffffffffffffffffffffffff9092168252519081900360200190f35b34801561024357600080fd5b5061020e610722565b34801561025857600080fd5b506101a36004356107c0565b34801561027057600080fd5b5061020e6004356107d2565b34801561028857600080fd5b506102946004356107fd565b6040805160208082528351818301528351919283929083019185019080838360005b838110156102ce5781810151838201526020016102b6565b50505050905090810190601f1680156102fb5780820380516001836020036101000a031916815260200191505b509250505060405180910390f35b34801561031557600080fd5b506101a36004356108a2565b34801561032d57600080fd5b5061016573ffffffffffffffffffffffffffffffffffffffff600435166108c1565b34801561035b57600080fd5b506101a36108c7565b34801561037057600080fd5b506103796108f7565b005b34801561038757600080fd5b506101a36109e2565b34801561039c57600080fd5b5061037973ffffffffffffffffffffffffffffffffffffffff60043516610a0d565b3480156103ca57600080fd5b50604080516020600460443581810135838102808601850190965280855261016595833573ffffffffffffffffffffffffffffffffffffffff16956024803596369695606495939492019291829185019084908082843750949750610d2f9650505050505050565b34801561043e57600080fd5b5061020e610ebf565b34801561045357600080fd5b50610379600435610f81565b34801561046b57600080fd5b5061016560043561160b565b34801561048357600080fd5b5061048f600435611620565b6040518086600019166000191681526020018573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200180602001848152602001838152602001828103825285818151815260200191508051906020019080838360005b83811015610518578181015183820152602001610500565b50505050905090810190601f1680156105455780820380516001836020036101000a031916815260200191505b50965050505050505060405180910390f35b34801561056357600080fd5b506103796004803573ffffffffffffffffffffffffffffffffffffffff1690602480359081019101356116ee565b34801561059d57600080fd5b5061020e611f32565b3480156105b257600080fd5b506101a3611f5d565b3480156105c757600080fd5b50610165611f92565b60026020526000908152604090205460ff1681565b6000806105f06109e2565b90508015801590610608575080610605611fa5565b10155b91505b5090565b6004545b90565b6000610620610ebf565b73ffffffffffffffffffffffffffffffffffffffff166304bf2a7f836040518263ffffffff167c01000000000000000000000000000000000000000000000000000000000281526004018080602001828103825283818151815260200191508051906020019080838360005b838110156106a457818101518382015260200161068c565b50505050905090810190601f1680156106d15780820380516001836020036101000a031916815260200191505b5092505050602060405180830381600087803b1580156106f057600080fd5b505af1158015610704573d6000803e3d6000fd5b505050506040513d602081101561071a57600080fd5b505192915050565b600061072c611f32565b73ffffffffffffffffffffffffffffffffffffffff166332f0a3b56040518163ffffffff167c0100000000000000000000000000000000000000000000000000000000028152600401602060405180830381600087803b15801561078f57600080fd5b505af11580156107a3573d6000803e3d6000fd5b505050506040513d60208110156107b957600080fd5b5051905090565b60036020526000908152604090205481565b60009081526020819052604090206001015473ffffffffffffffffffffffffffffffffffffffff1690565b600081815260208181526040918290206002908101805484516000196001831615610100020190911692909204601f810184900484028301840190945283825260609391929091908301828280156108965780601f1061086b57610100808354040283529160200191610896565b820191906000526020600020905b81548152906001019060200180831161087957829003601f168201915b50505050509050919050565b60048054829081106108b057fe5b600091825260209091200154905081565b50600190565b60006108f27fd625496217aa6a3453eecb9c3489dc5a53e6c67b444329ea2b2cbc9ff547639b611fa9565b905090565b6108ff6109e2565b60408051808201909152601881527f494e49545f414c52454144595f494e495449414c495a45440000000000000000602082015290156109d7576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825283818151815260200191508051906020019080838360005b8381101561099c578181015183820152602001610984565b50505050905090810190601f1680156109c95780820380516001836020036101000a031916815260200191505b509250505060405180910390fd5b506109e0611fad565b565b60006108f27febb05b386a8d34882b8711d156f463690983dc47815980fb82aeeff1aa43579e611fa9565b6000806000610a1b846108c1565b60408051808201909152601281527f5245434f5645525f444953414c4c4f57454400000000000000000000000000006020820152901515610ab8576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825283818151815260200191508051906020019080838360008381101561099c578181015183820152602001610984565b50610ac1610722565b9250610acc8361208e565b60408051808201909152601a81527f5245434f5645525f5641554c545f4e4f545f434f4e54524143540000000000006020820152901515610b69576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825283818151815260200191508051906020019080838360008381101561099c578181015183820152602001610984565b5073ffffffffffffffffffffffffffffffffffffffff84161515610bd4576040513031925073ffffffffffffffffffffffffffffffffffffffff84169083156108fc029084906000818181858888f19350505050158015610bce573d6000803e3d6000fd5b50610cc4565b5082610bfc73ffffffffffffffffffffffffffffffffffffffff82163063ffffffff6120c816565b9150610c2573ffffffffffffffffffffffffffffffffffffffff8216848463ffffffff61220116565b60408051808201909152601d81527f5245434f5645525f544f4b454e5f5452414e534645525f4641494c45440000006020820152901515610cc2576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825283818151815260200191508051906020019080838360008381101561099c578181015183820152602001610984565b505b8373ffffffffffffffffffffffffffffffffffffffff168373ffffffffffffffffffffffffffffffffffffffff167f596caf56044b55fb8c4ca640089bbc2b63cae3e978b851f5745cbb7c5b288e02846040518082815260200191505060405180910390a350505050565b600080610d3a6105e5565b1515610d495760009150610eb7565b610d51611f32565b905073ffffffffffffffffffffffffffffffffffffffff81161515610d795760009150610eb7565b8073ffffffffffffffffffffffffffffffffffffffff1663fdef9106863087610da188612299565b6040517c010000000000000000000000000000000000000000000000000000000063ffffffff871602815273ffffffffffffffffffffffffffffffffffffffff808616600483019081529085166024830152604482018490526080606483019081528351608484015283519192909160a490910190602085019080838360005b83811015610e39578181015183820152602001610e21565b50505050905090810190601f168015610e665780820380516001836020036101000a031916815260200191505b5095505050505050602060405180830381600087803b158015610e8857600080fd5b505af1158015610e9c573d6000803e3d6000fd5b505050506040513d6020811015610eb257600080fd5b505191505b509392505050565b600080610eca611f32565b604080517fbe00bbd80000000000000000000000000000000000000000000000000000000081527fd6f028ca0e8edb4a8c9757ca4fdccab25fa1e0317da1188108f7d2dee14902fb60048201527fddbcfd564f642ab5627cf68b9b7d374fb4f8a36e941a75d89c87998cef03bd616024820152905173ffffffffffffffffffffffffffffffffffffffff929092169163be00bbd8916044808201926020929091908290030181600087803b1580156106f057600080fd5b604080517f4d4f444946595f524f4c450000000000000000000000000000000000000000008152815190819003600b018120600080835260208301909352829182918291829190610fd89033908390855b50610d2f565b60408051808201909152600f81527f4150505f415554485f4641494c454400000000000000000000000000000000006020820152901515611075576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825283818151815260200191508051906020019080838360008381101561099c578181015183820152602001610984565b50600080886000191660001916815260200190815260200160002095508560020160405160200180828054600181600116156101000203166002900480156110f45780601f106110d25761010080835404028352918201916110f4565b820191906000526020600020905b8154815290600101906020018083116110e0575b50509150506040516020818303038152906040526040518082805190602001908083835b6020831061115557805182527fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe09092019160209182019101611118565b51815160209384036101000a6000190180199092169116179052604080519290940182900382208c54838601909552601883527f4552524f525f434154414c5953545f4e4f545f464f554e4400000000000000009183019190915299509350508914905061121f576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825283818151815260200191508051906020019080838360008381101561099c578181015183820152602001610984565b50600186015473ffffffffffffffffffffffffffffffffffffffff16600090815260026020908152604091829020548251808401909352601e83527f4552524f525f434154414c5953545f414c52454144595f52454d4f56454400009183019190915260ff1615156112ed576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825283818151815260200191508051906020019080838360008381101561099c578181015183820152602001610984565b50600085815260016020908152604091829020548251808401909352601e83527f4552524f525f434154414c5953545f414c52454144595f52454d4f56454400009183019190915260ff1615156113a0576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825283818151815260200191508051906020019080838360008381101561099c578181015183820152602001610984565b50600486015460408051808201909152601e81527f4552524f525f434154414c5953545f414c52454144595f52454d4f564544000060208201529015611442576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825283818151815260200191508051906020019080838360008381101561099c578181015183820152602001610984565b50600161144d61060f565b600089815260036020526040902054600480549390920396509450908590811061147357fe5b906000526020600020015491508160048481548110151561149057fe5b60009182526020808320909101929092558381526003825260409081902085905542600489015560018089015482518481526002808c0180549485161561010002600019019094160494810185905273ffffffffffffffffffffffffffffffffffffffff909116938b937f70eb412a868c3536062a3c120b21934d3577c56f5ab14eb4c703ca3f8b5e2c989392918291820190849080156115725780601f1061154757610100808354040283529160200191611572565b820191906000526020600020905b81548152906001019060200180831161155557829003601f168201915b50509250505060405180910390a36004805490611593906000198301612326565b5050506000948552505060036020908152604080852085905560019384015473ffffffffffffffffffffffffffffffffffffffff1685526002825280852080547fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff00908116909155928552929052912080549091169055565b60016020526000908152604090205460ff1681565b6000602081815291815260409081902080546001808301546002808501805487516101009582161595909502600019011691909104601f8101889004880284018801909652858352929573ffffffffffffffffffffffffffffffffffffffff90911694919291908301828280156116d85780601f106116ad576101008083540402835291602001916116d8565b820191906000526020600020905b8154815290600101906020018083116116bb57829003601f168201915b5050505050908060030154908060040154905085565b604080517f4d4f444946595f524f4c450000000000000000000000000000000000000000008152815190819003600b0181206000808352602083019093526060929182918291829190611745903390839085610fd2565b60408051808201909152600f81527f4150505f415554485f4641494c4544000000000000000000000000000000000060208201529015156117e2576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825283818151815260200191508051906020019080838360008381101561099c578181015183820152602001610984565b5060408051808201909152601181527f4552524f525f4f574e45525f454d505459000000000000000000000000000000602082015273ffffffffffffffffffffffffffffffffffffffff8a161515611896576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825283818151815260200191508051906020019080838360008381101561099c578181015183820152602001610984565b50878760405160200180838380828437820191505092505050604051602081830303815290604052955060008651116040805190810160405280601281526020017f4552524f525f444f4d41494e5f454d5054590000000000000000000000000000815250901515611964576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825283818151815260200191508051906020019080838360008381101561099c578181015183820152602001610984565b50856040518082805190602001908083835b602083106119b357805182527fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe09092019160209182019101611976565b6001836020036101000a03801982511681845116808217855250505050505090500191505060405180910390209450600260008a73ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060009054906101000a900460ff16156040805190810160405280601281526020017f4552524f525f4f574e45525f494e5f5553450000000000000000000000000000815250901515611acf576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825283818151815260200191508051906020019080838360008381101561099c578181015183820152602001610984565b50600085815260016020908152604091829020548251808401909352601383527f4552524f525f444f4d41494e5f494e5f555345000000000000000000000000009183019190915260ff1615611b81576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825283818151815260200191508051906020019080838360008381101561099c578181015183820152602001610984565b5042935083898989604051602001808581526020018473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff166c0100000000000000000000000002815260140183838082843782019150509450505050506040516020818303038152906040526040518082805190602001908083835b60208310611c4457805182527fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe09092019160209182019101611c07565b51815160209384036101000a600019018019909216911617905260408051929094018290038220600081815280835285902060010154838601909552600f83527f4552524f525f49445f494e5f555345000000000000000000000000000000000091830191909152975093505073ffffffffffffffffffffffffffffffffffffffff16159050611d30576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825283818151815260200191508051906020019080838360008381101561099c578181015183820152602001610984565b5060a060405190810160405280846000191681526020018a73ffffffffffffffffffffffffffffffffffffffff16815260200189898080601f01602080910402602001604051908101604052809392919081815260200183838082843750505092845250505060208082018790526000604092830181905286815280825282902083518155838201516001820180547fffffffffffffffffffffffff00000000000000000000000000000000000000001673ffffffffffffffffffffffffffffffffffffffff909216919091179055918301518051611e15926002850192019061234f565b50606082015160038281019190915560809092015160049182015573ffffffffffffffffffffffffffffffffffffffff8b166000818152600260209081526040808320805460017fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff0091821681179092558c85528184528285208054909116821790558554908101958690557f8a35acfbc15ff81a39ae7d344fd709f28e8600b4aa8c65c6b64bfe7fe36bd19b81018a9055898452958252918290209490945580518481529384018b90529194509185917f2d78ff4efbd510d499bdf77bcccb8d9577d4245582a2f4b15d56190ce5d8caf6918c918c91908190810184848082843760405192018290039550909350505050a3505050505050505050565b60006108f27f4172f0f7d2289153072b0a6ca36959e0cbe2efc3afe50fc81636caa96338137b611fa9565b604080517f4d4f444946595f524f4c450000000000000000000000000000000000000000008152905190819003600b01902081565b6000600019611f9f6109e2565b14905090565b4390565b5490565b611fb56109e2565b60408051808201909152601881527f494e49545f414c52454144595f494e495449414c495a4544000000000000000060208201529015612051576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825283818151815260200191508051906020019080838360008381101561099c578181015183820152602001610984565b506109e061205d611fa5565b7febb05b386a8d34882b8711d156f463690983dc47815980fb82aeeff1aa43579e9063ffffffff6122a316565b5490565b60008073ffffffffffffffffffffffffffffffffffffffff831615156120b757600091506120c2565b823b90506000811191505b50919050565b6040805173ffffffffffffffffffffffffffffffffffffffff83166024808301919091528251808303909101815260449091019091526020810180517bffffffffffffffffffffffffffffffffffffffffffffffffffffffff167f70a0823100000000000000000000000000000000000000000000000000000000179052600090818061215586846122a7565b60408051808201909152601c81527f534146455f4552435f32305f42414c414e43455f524556455254454400000000602082015291935091508215156121f7576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825283818151815260200191508051906020019080838360008381101561099c578181015183820152602001610984565b5095945050505050565b6040805173ffffffffffffffffffffffffffffffffffffffff8416602482015260448082018490528251808303909101815260649091019091526020810180517bffffffffffffffffffffffffffffffffffffffffffffffffffffffff167fa9059cbb0000000000000000000000000000000000000000000000000000000017905260009061229085826122d8565b95945050505050565b8051602002815290565b9055565b6000806000806040516020818751602089018a5afa925060008311156122cc57805191505b50909590945092505050565b6000806040516020818551602087016000895af1600081111561231c573d801561230957602081146123125761231a565b6001935061231a565b600183511493505b505b5090949350505050565b81548183558181111561234a5760008381526020902061234a9181019083016123c5565b505050565b828054600181600116156101000203166002900490600052602060002090601f016020900481019282601f1061239057805160ff19168380011785556123bd565b828001600101855582156123bd579182015b828111156123bd5782518255916020019190600101906123a2565b5061060b9291505b61061391905b8082111561060b57600081556001016123cb5600a165627a7a723058202b5c1bc43f3db208e86c598bb60d6a1b165347c6ccbc1a0501915bde947de86f0029ebb05b386a8d34882b8711d156f463690983dc47815980fb82aeeff1aa43579e'
    ) as any
  }
}
