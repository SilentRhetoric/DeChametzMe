// src/components/Home.tsx
import { useWallet } from '@txnlab/use-wallet-react'
import React, { useState } from 'react'
import AppCalls from './components/AppCalls'
import ConnectWallet from './components/ConnectWallet'
import ContractInfo from './components/Contract'

interface HomeProps {}

const Home: React.FC<HomeProps> = () => {
  const [openWalletModal, setOpenWalletModal] = useState<boolean>(false)
  const [appCallsDemoModal, setAppCallsDemoModal] = useState<boolean>(false)
  const { activeAddress } = useWallet()

  const toggleWalletModal = () => {
    setOpenWalletModal(!openWalletModal)
  }

  const toggleAppCallsModal = () => {
    setAppCallsDemoModal(!appCallsDemoModal)
  }

  return (
    <div className="hero min-h-screen bg-gray-900">
      <div className="hero-content mx-auto max-w-md rounded-lg border-2 border-black bg-gray-900 p-6 text-center text-white">
        <div className="max-w-md">
          <h1 className="text-4xl">
            Welcome to <div className="font-bold">DeChametz Me</div>
          </h1>
          <p className="py-6">De-chametz yourself! Sell your chametz to a smart contract before Pesach and repurchase it after.</p>
          <ContractInfo />
          <div className="grid">
            <div className="divider" />
            <button data-test-id="connect-wallet" className="btn m-2" onClick={toggleWalletModal}>
              Wallet Connection
            </button>
            {activeAddress && (
              <button data-test-id="appcalls-demo" className="btn m-2" onClick={toggleAppCallsModal}>
                Contract Demo
              </button>
            )}
          </div>
          <ConnectWallet openModal={openWalletModal} closeModal={toggleWalletModal} />
          <AppCalls openModal={appCallsDemoModal} setModalState={setAppCallsDemoModal} />
        </div>
      </div>
    </div>
  )
}

export default Home
