import { AlgorandClient, Config } from '@algorandfoundation/algokit-utils'
import { useWallet } from '@txnlab/use-wallet-react'
import { useSnackbar } from 'notistack'
import { useState } from 'react'
import { DeChametzClient } from '../contracts/DeChametz'
import { getAlgodConfigFromViteEnvironment, getIndexerConfigFromViteEnvironment } from '../utils/network/getAlgoClientConfigs'

interface AppCallsProps {
  modalOpen: boolean
  setAppCallsModalOpen: React.Dispatch<React.SetStateAction<boolean>>
  activeDeal: boolean
  setLastTxnID: React.Dispatch<React.SetStateAction<string | undefined>>
  fetchData: () => Promise<void>
}

const AppCalls = ({ modalOpen, setAppCallsModalOpen, activeDeal, setLastTxnID }: AppCallsProps) => {
  const [loading, setLoading] = useState<boolean>(false)
  const [contractInput, setContractInput] = useState<string>('')
  const { enqueueSnackbar } = useSnackbar()
  const { transactionSigner, activeAddress } = useWallet()

  Config.configure({ populateAppCallResources: true })
  const algodConfig = getAlgodConfigFromViteEnvironment()
  const indexerConfig = getIndexerConfigFromViteEnvironment()
  const algorand = AlgorandClient.fromConfig({
    algodConfig,
    indexerConfig,
  })
  algorand.setDefaultSigner(transactionSigner)
  algorand.setDefaultValidityWindow(100)

  const sellChametz = async () => {
    setLoading(true)
    const appClient = new DeChametzClient({ algorand, appId: 2920830754n })
    const assetOptIn = await algorand.createTransaction.assetOptIn({ assetId: 2920837237n, sender: activeAddress! })
    const response = await appClient
      .newGroup()
      .addTransaction(assetOptIn)
      .optIn.sellChametz({ args: { chametz: contractInput }, sender: activeAddress!, staticFee: (2000).microAlgos() })
      .send({ maxRoundsToWaitForConfirmation: 100 })
      .catch((e: Error) => {
        enqueueSnackbar(`Error calling the contract: ${e.message}`, { variant: 'error' })
        setLoading(false)
        return undefined
      })
    if (!response) {
      return
    }
    // eslint-disable-next-line no-console
    console.debug('response', response)
    enqueueSnackbar(`Successfully sold the ${response.returns[0]}`, { variant: 'success' })
    setLoading(false)
    setAppCallsModalOpen(false)
    setLastTxnID(response.txIds[1])
  }

  const repurchaseChametz = async () => {
    setLoading(true)
    const appClient = new DeChametzClient({ algorand, appId: 2920830754n })
    const response = await (
      await appClient.newGroup().closeOut.repurchaseChametz({ args: [], sender: activeAddress!, staticFee: (2000).microAlgos() }).composer()
    )
      .addAssetOptOut({
        assetId: 2920837237n,
        sender: activeAddress!,
        creator: 'BMTX6P3MW6IMD3SJMKPOJYQJFMGA7ZXV2N7SNV4ZGTV7V2VR4QJ7P7KBVQ', // The app created the ASA
      })
      .send({ maxRoundsToWaitForConfirmation: 100 })
      .catch((e: Error) => {
        enqueueSnackbar(`Error calling the contract: ${e.message}`, { variant: 'error' })
        setLoading(false)
        return undefined
      })
    if (!response) {
      return
    }
    // eslint-disable-next-line no-console
    console.debug('response', response)
    enqueueSnackbar(`Successfully repurchased the ${response.returns![0].returnValue}`, { variant: 'success' })
    setLoading(false)
    setAppCallsModalOpen(false)
    setLastTxnID(response.txIds[0])
  }

  return (
    <dialog id="appcalls_modal" className={`modal ${modalOpen ? 'modal-open' : ''}`}>
      <form method="dialog" className="modal-box">
        <button
          className="btn-ghost btn-sm btn-circle btn absolute right-2 top-2"
          onClick={() => {
            setAppCallsModalOpen(false)
          }}
        >
          ✕
        </button>
        {activeDeal ? (
          <div className="grid gap-4">
            <h3 className="text-xl">Repurchase the chametz from the smart contract!</h3>
            <div className="modal-action">
              <button className="btn-primary btn" onClick={repurchaseChametz}>
                {loading ? <span className="loading loading-spinner" /> : 'Send application call'}
              </button>
            </div>
          </div>
        ) : (
          <div className="grid gap-4">
            <h3 className="text-xl">Sell your chametz to the smart contract!</h3>
            <input
              type="text"
              placeholder="Describe the chametz to be sold"
              className="input-bordered input-primary input w-full"
              value={contractInput}
              onChange={(e) => {
                setContractInput(e.target.value)
              }}
            />
            <div className="modal-action">
              <button className="btn-primary btn" onClick={sellChametz}>
                {loading ? <span className="loading loading-spinner" /> : 'Send application call'}
              </button>
            </div>
          </div>
        )}
      </form>
    </dialog>
  )
}

export default AppCalls
