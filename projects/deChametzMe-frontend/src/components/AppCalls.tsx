import { AlgorandClient } from '@algorandfoundation/algokit-utils'
import { useWallet } from '@txnlab/use-wallet-react'
import { useSnackbar } from 'notistack'
import { useState } from 'react'
import { DeChametzClient } from '../contracts/DeChametz'
import { getAlgodConfigFromViteEnvironment, getIndexerConfigFromViteEnvironment } from '../utils/network/getAlgoClientConfigs'

interface AppCallsInterface {
  openModal: boolean
  setModalState: (value: boolean) => void
}

const AppCalls = ({ openModal, setModalState }: AppCallsInterface) => {
  const [loading, setLoading] = useState<boolean>(false)
  const [contractInput, setContractInput] = useState<string>('')
  const { enqueueSnackbar } = useSnackbar()
  const { transactionSigner, activeAddress } = useWallet()

  const algodConfig = getAlgodConfigFromViteEnvironment()
  const indexerConfig = getIndexerConfigFromViteEnvironment()
  const algorand = AlgorandClient.fromConfig({
    algodConfig,
    indexerConfig,
  })
  algorand.setDefaultSigner(transactionSigner)

  const sendAppCall = async () => {
    setLoading(true)

    // For TestNet, the app is already deployed so a client can be created
    const appClient = new DeChametzClient({ algorand, appId: 733981798n })

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

    const response = await appClient.send.optIn
      .sellChametz({ args: { chametz: contractInput }, sender: activeAddress! })
      .catch((e: Error) => {
        enqueueSnackbar(`Error calling the contract: ${e.message}`, { variant: 'error' })
        setLoading(false)
        return undefined
      })

    if (!response) {
      return
    }

    enqueueSnackbar(`Response from the contract: ${response.return}`, { variant: 'success' })
    setLoading(false)
  }

  return (
    <dialog id="appcalls_modal" className={`modal ${openModal ? 'modal-open' : ''} bg-slate-200`}>
      <form method="dialog" className="modal-box">
        <h3 className="text-lg font-bold">Say hello to your Algorand smart contract</h3>
        <br />
        <input
          type="text"
          placeholder="Provide input to method call"
          className="input-bordered input w-full"
          value={contractInput}
          onChange={(e) => {
            setContractInput(e.target.value)
          }}
        />
        <div className="modal-action">
          <button className="btn" onClick={() => setModalState(!openModal)}>
            Close
          </button>
          <button className={`btn`} onClick={sendAppCall}>
            {loading ? <span className="loading loading-spinner" /> : 'Send application call'}
          </button>
        </div>
      </form>
    </dialog>
  )
}

export default AppCalls
