import { AlgorandClient } from '@algorandfoundation/algokit-utils'
import { ABIStringType, isValidAddress } from 'algosdk'
import { useEffect, useMemo, useState } from 'react'
import { DeChametzClient } from '../contracts/DeChametz'
import {
  getAlgodConfigFromViteEnvironment,
  getAppIDFromViteEnvironment,
  getIndexerConfigFromViteEnvironment,
} from '../utils/network/getAlgoClientConfigs'
import AppCalls from './AppCalls'

interface ContractInfoProps {
  address: string | null
}

const ContractInfo = ({ address }: ContractInfoProps) => {
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
  const [chametzSold, setChametzSold] = useState<string | undefined>()
  const [activeDeal, setActiveDeal] = useState<boolean>(false)
  const [appCallsModalOpen, setAppCallsModalOpen] = useState<boolean>(false)
  const [lastTxnID, setLastTxnID] = useState<string | undefined>(undefined)

  async function fetchData() {
    try {
      const isJewish = await appClient.state.global.isJewish()
      setIsJewish(isJewish)
      const tokenId = await appClient.state.global.tokenAssetId()
      setTokenId(tokenId)
      if (address && isValidAddress(address)) {
        const chametzSoldBytes = await (await appClient.state.local(address).chametzSold()).asByteArray()
        if (chametzSoldBytes !== undefined) {
          const chametzDescr = new ABIStringType().decode(chametzSoldBytes)
          setChametzSold(chametzDescr)
          if (typeof chametzDescr === 'string' && chametzDescr.length > 0) {
            setActiveDeal(true)
          } else setActiveDeal(false)
        }
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error fetching data:', error)
      setChametzSold(undefined)
      setActiveDeal(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [lastTxnID])

  const toggleAppCallsModal = () => {
    setAppCallsModalOpen(!appCallsModalOpen)
  }

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      {address && (
        <div className="grid gap-2">
          <button className="btn-primary btn m-auto" onClick={toggleAppCallsModal}>
            {`${activeDeal ? 'Repurchase' : 'Sell'} Chametz`}
          </button>
          <p>Active Deal: {activeDeal ? 'Yes' : 'No'}</p>
          {activeDeal && <p>Chametz you sold to the smart contract:</p>}
          {activeDeal && <p>{chametzSold}</p>}
          {lastTxnID && (
            <a target="_blank" href={`https://lora.algokit.io/${networkName}/transaction/${lastTxnID}/`}>
              <button className="btn-accent btn">View transcation on Lora ↗</button>
            </a>
          )}
        </div>
      )}
      <div className="grid gap-2 rounded-lg p-4">
        <h2 className="text-xl">Smart Contract Details</h2>
        <p>Religion: {isJewish === 'no' ? 'Non-Jewish' : null}</p>
        <p>4CHAMETZ Token ID: {tokenId?.toString()}</p>
        <a target="_blank" href={`https://lora.algokit.io/${networkName}/application/${appId}/`}>
          <button className="btn-accent btn">View application on Lora ↗</button>
        </a>
      </div>
      <AppCalls
        modalOpen={appCallsModalOpen}
        setAppCallsModalOpen={setAppCallsModalOpen}
        activeDeal={activeDeal}
        setLastTxnID={setLastTxnID}
        fetchData={fetchData}
      />
    </div>
  )
}

export default ContractInfo
