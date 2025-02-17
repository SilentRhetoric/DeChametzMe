import { AlgorandClient } from '@algorandfoundation/algokit-utils'
import { useEffect, useMemo, useState } from 'react'
import { DeChametzClient } from '../contracts/DeChametz'
import {
  getAlgodConfigFromViteEnvironment,
  getAppIDFromViteEnvironment,
  getIndexerConfigFromViteEnvironment,
} from '../utils/network/getAlgoClientConfigs'

const ContractInfo = () => {
  const algoConfig = getAlgodConfigFromViteEnvironment()
  const appId = getAppIDFromViteEnvironment()

  const networkName = useMemo(() => {
    return algoConfig.network === '' ? 'localnet' : algoConfig.network.toLocaleLowerCase()
  }, [algoConfig.network])

  const algodConfig = getAlgodConfigFromViteEnvironment()
  const indexerConfig = getIndexerConfigFromViteEnvironment()
  const algorand = AlgorandClient.fromConfig({
    algodConfig,
    indexerConfig,
  })
  const appClient = useMemo(() => new DeChametzClient({ algorand, appId: BigInt(appId) }), [appId, algorand])

  const [isJewish, setIsJewish] = useState<string | undefined>()
  const [tokenId, setTokenId] = useState<bigint | undefined>()

  useEffect(() => {
    async function fetchData() {
      try {
        const isJewish = await appClient.state.global.isJewish()
        setIsJewish(isJewish)
        const tokenId = await appClient.state.global.tokenAssetId()
        setTokenId(tokenId)
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error fetching data:', error)
      }
    }
    fetchData()
  }, [appClient])

  return (
    <div>
      <a className="text-xl " target="_blank" href={`https://lora.algokit.io/${networkName}/application/${appId}/`}>
        View Application on Lora
      </a>
      <p className="">Smart Contract Religion: {isJewish === 'no' ? 'Non-Jewish' : null}</p>
      <p className="">Token ID: {tokenId?.toString()}</p>
    </div>
  )
}

export default ContractInfo
