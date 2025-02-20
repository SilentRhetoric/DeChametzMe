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
      <a target="_blank" href="https://github.com/SilentRhetoric/DeChametzMe" className="absolute right-4 top-4">
        <svg width="98px" height="96px" viewBox="0 0 98 96" version="1.1" xmlns="http://www.w3.org/2000/svg" className="h-8 w-8">
          <g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
            <g id="github-mark" transform="translate(-0, -0)" fill="white">
              <path
                d="M48.854,0 C21.839,0 0,22 0,49.217 C0,70.973 13.993,89.389 33.405,95.907 C35.832,96.397 36.721,94.848 36.721,93.545 C36.721,92.404 36.641,88.493 36.641,84.418 C23.051,87.352 20.221,78.551 20.221,78.551 C18.037,72.847 14.801,71.381 14.801,71.381 C10.353,68.366 15.125,68.366 15.125,68.366 C20.059,68.692 22.648,73.418 22.648,73.418 C27.015,80.914 34.052,78.796 36.883,77.492 C37.287,74.314 38.582,72.114 39.957,70.892 C29.118,69.751 17.714,65.514 17.714,46.609 C17.714,41.231 19.654,36.831 22.728,33.409 C22.243,32.187 20.544,27.134 23.214,20.371 C23.214,20.371 27.339,19.067 36.64,25.423 C40.6220889,24.3456626 44.7287526,23.7976143 48.854,23.793 C52.979,23.793 57.184,24.364 61.067,25.423 C70.369,19.067 74.494,20.371 74.494,20.371 C77.164,27.134 75.464,32.187 74.979,33.409 C78.134,36.831 79.994,41.231 79.994,46.609 C79.994,65.514 68.59,69.669 57.67,70.892 C59.45,72.44 60.986,75.373 60.986,80.018 C60.986,86.618 60.906,91.915 60.906,93.544 C60.906,94.848 61.796,96.397 64.222,95.908 C83.634,89.388 97.6272183,70.973 97.6272183,49.217 C97.707,22 75.788,0 48.854,0 Z"
                id="Path"
              ></path>
            </g>
          </g>
        </svg>
      </a>
      <div className="hero-content mx-auto max-w-md rounded-lg border-2 border-white bg-base-100 text-center text-white">
        <div className="grid max-w-md gap-4">
          <h1 className="text-3xl">
            Welcome to <div className="text-4xl font-bold">DeChametz Me</div>
          </h1>
          <p className="">De-chametz yourself! Sell your chametz to a smart contract before Pesach and repurchase it after.</p>
          <ContractInfo address={activeAddress} />
          <button
            data-test-id="connect-wallet"
            className={`${activeAddress ? 'btn-secondary' : 'btn-primary'} btn m-auto`}
            onClick={toggleWalletModal}
          >
            {activeAddress ? 'Wallet Connection' : 'Connect Wallet'}
          </button>
          <ConnectWallet openModal={walletModalOpen} closeModal={toggleWalletModal} />
        </div>
      </div>
    </div>
  )
}

export default Home
