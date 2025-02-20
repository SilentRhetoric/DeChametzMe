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

  const sellChametz = async () => {
    setLoading(true)

    // // Please note, in typical production scenarios,
    // // you wouldn't want to use deploy directly from your frontend.
    // // Instead, you would deploy your contract on your backend and reference it by id.
    // // Given the simplicity of the starter contract, we are deploying it on the frontend
    // // for demonstration purposes.
    // const factory = new DeChametzFactory({
    //   defaultSender: activeAddress,
    //   algorand,
    // })
    // const deployResult = await factory
    //   .deploy({
    //     onSchemaBreak: OnSchemaBreak.AppendApp,
    //     onUpdate: OnUpdate.AppendApp,
    //   })
    //   .catch((e: Error) => {
    //     enqueueSnackbar(`Error deploying the contract: ${e.message}`, { variant: 'error' })
    //     setLoading(false)
    //     return undefined
    //   })
    // if (!deployResult) {
    //   return
    // }
    // const { appClient } = deployResult

    const appClient = new DeChametzClient({ algorand, appId: 733981798n })
    const assetOptIn = await algorand.createTransaction.assetOptIn({ assetId: 733984119n, sender: activeAddress! })
    const response = await appClient
      // .algorand // This doesn't work because you can't get back to the typed app opt in
      // .newGroup()
      // .addAssetOptIn({ assetId: 733984119n, sender: activeAddress! })
      .newGroup()
      .addTransaction(assetOptIn)
      .optIn.sellChametz({ args: { chametz: contractInput }, sender: activeAddress!, staticFee: (2000).microAlgos() })
      .send()
      .catch((e: Error) => {
        enqueueSnackbar(`Error calling the contract: ${e.message}`, { variant: 'error' })
        setLoading(false)
        return undefined
      })
    if (!response) {
      return
    }
    console.debug('response', response)
    enqueueSnackbar(`Successfully sold the ${response.returns[0]}`, { variant: 'success' })
    setLoading(false)
    setAppCallsModalOpen(false)
    setLastTxnID(response.txIds[1])
  }

  const repurchaseChametz = async () => {
    setLoading(true)
    const appClient = new DeChametzClient({ algorand, appId: 733981798n })
    const response = await (
      await appClient.newGroup().closeOut.repurchaseChametz({ args: [], sender: activeAddress!, staticFee: (2000).microAlgos() }).composer()
    )
      .addAssetOptOut({
        assetId: 733984119n,
        sender: activeAddress!,
        creator: '3226CCPA67CBWB3ALPKTQKULVO6V2AHUDMGNFDQBOQPVGMYVOE2D6SKKNA', // The app created the ASA
      })
      .send()
      .catch((e: Error) => {
        enqueueSnackbar(`Error calling the contract: ${e.message}`, { variant: 'error' })
        setLoading(false)
        return undefined
      })
    if (!response) {
      return
    }
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
