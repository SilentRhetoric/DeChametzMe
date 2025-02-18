// src/components/Home.tsx
import { useWallet } from '@txnlab/use-wallet-react'
import React, { useState } from 'react'
import ConnectWallet from './components/ConnectWallet'
import ContractInfo from './components/Contract'

interface HomeProps {}

const Home: React.FC<HomeProps> = () => {
  const [walletModalOpen, setWalletModalOpen] = useState<boolean>(false)
  const { activeAddress } = useWallet()

  const toggleWalletModal = () => {
    setWalletModalOpen(!walletModalOpen)
  }

  return (
    <div className="hero min-h-screen">
      <div className="hero-content mx-auto max-w-md rounded-lg border-2 border-white bg-base-100 p-4 text-center text-white">
        <div className="grid max-w-md gap-4">
          <h1 className="text-3xl">
            Welcome to <div className="text-4xl font-bold">DeChametz Me</div>
          </h1>
          <p className="">De-chametz yourself! Sell your chametz to a smart contract before Pesach and repurchase it after.</p>
          <ContractInfo address={activeAddress} />
          <div className="grid gap-4">
            <button data-test-id="connect-wallet" className="btn-primary btn" onClick={toggleWalletModal}>
              Wallet Connection
            </button>
          </div>
          <ConnectWallet openModal={walletModalOpen} closeModal={toggleWalletModal} />
        </div>
      </div>
    </div>
  )
}

export default Home
