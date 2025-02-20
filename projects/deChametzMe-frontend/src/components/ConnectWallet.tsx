import { useWallet, Wallet, WalletId } from '@txnlab/use-wallet-react'
import Account from './Account'

interface ConnectWalletInterface {
  modalOpen: boolean
  setWalletModalOpen: React.Dispatch<React.SetStateAction<boolean>>
}

const ConnectWallet = ({ modalOpen, setWalletModalOpen }: ConnectWalletInterface) => {
  const { wallets, activeAddress } = useWallet()

  const isKmd = (wallet: Wallet) => wallet.id === WalletId.KMD

  return (
    <dialog id="connect_wallet_modal" className={`modal ${modalOpen ? 'modal-open' : ''}`}>
      <form method="dialog" className="modal-box flex flex-col gap-4 rounded-lg border-2 border-white">
        <button
          className="btn-ghost btn-sm btn-circle btn absolute right-2 top-2"
          onClick={() => {
            setWalletModalOpen(false)
          }}
        >
          ✕
        </button>
        <h3 className="text-2xl font-bold">{activeAddress ? 'Connected Wallet' : 'Connect Your Wallet'}</h3>
        <div className="grid gap-2">
          {activeAddress && <Account />}
          {!activeAddress &&
            wallets?.map((wallet) => (
              <button
                className="btn-outline btn"
                key={`provider-${wallet.id}`}
                onClick={() => {
                  wallet.connect()
                  setWalletModalOpen(false)
                }}
              >
                {!isKmd(wallet) && (
                  <img
                    alt={`wallet_icon_${wallet.id}`}
                    src={wallet.metadata.icon}
                    style={{ objectFit: 'contain', width: '30px', height: 'auto' }}
                  />
                )}
                <span>{isKmd(wallet) ? 'LocalNet Wallet' : wallet.metadata.name}</span>
              </button>
            ))}
        </div>
        {activeAddress && (
          <div className="modal-action">
            <button
              className="btn-warning btn"
              onClick={async () => {
                if (wallets) {
                  const activeWallet = wallets.find((w) => w.isActive)
                  if (activeWallet) {
                    await activeWallet.disconnect()
                  } else {
                    // Required for cleanup of inactive wallet providers
                    localStorage.removeItem('@txnlab/use-wallet:v4')
                    window.location.reload()
                  }
                }
                setWalletModalOpen(false)
              }}
            >
              Disconnect
            </button>
          </div>
        )}
      </form>
    </dialog>
  )
}
export default ConnectWallet
