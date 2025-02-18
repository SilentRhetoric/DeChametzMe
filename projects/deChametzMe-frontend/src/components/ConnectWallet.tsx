import { useWallet, Wallet, WalletId } from '@txnlab/use-wallet-react'
import Account from './Account'

interface ConnectWalletInterface {
  openModal: boolean
  closeModal: () => void
}

const ConnectWallet = ({ openModal, closeModal }: ConnectWalletInterface) => {
  const { wallets, activeAddress } = useWallet()

  const isKmd = (wallet: Wallet) => wallet.id === WalletId.KMD

  return (
    <dialog id="connect_wallet_modal" className={`modal ${openModal ? 'modal-open' : ''}`}>
      <form method="dialog" className="modal-box flex flex-col gap-4 rounded-lg border-2 border-white">
        <button
          data-test-id="close-wallet-modal"
          className="btn-ghost btn-sm btn-circle btn absolute right-2 top-2"
          onClick={() => {
            closeModal()
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
                data-test-id={`${wallet.id}-connect`}
                className="btn-outline btn"
                key={`provider-${wallet.id}`}
                onClick={() => {
                  return wallet.connect()
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
              data-test-id="logout"
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
