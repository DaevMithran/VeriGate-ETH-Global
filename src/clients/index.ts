import {
  ChainType,
  SpMode,
  OnChainClientOptions,
  OffChainClientOptions,
  SignType,
} from "../types/index.js"
import { SignProtocolClientBase } from "../interface/SignProtocolClientBase.js"
import EvmClients from "./evm/index.js"
import { EvmChains } from "./evm/types.js"

export function getClient(
  mode: SpMode,
  options: OnChainClientOptions | OffChainClientOptions
): SignProtocolClientBase {
  if (mode === SpMode.OffChain) {
    const [chainType, signType] = (
      options as OffChainClientOptions
    ).signType.split("-") as [ChainType, SignType]
    switch (chainType) {
      case ChainType.evm:
        return new EvmClients.OffChainClient({
          ...options,
          signType,
        })
      default:
        throw new Error("ChainType not supported")
    }
  } else {
    const { chain } = options as OnChainClientOptions
    switch (chain) {
      case EvmChains[chain]:
        return new EvmClients.OnChainClient(options as OnChainClientOptions)
      default:
        throw new Error("ChainType not supported")
    }
  }
}
