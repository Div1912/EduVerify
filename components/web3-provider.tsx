"use client"

import { createContext, useEffect, useState, type ReactNode } from "react"
import { ethers } from "ethers"
import { useToast } from "@/hooks/use-toast"

// ABI for the AcademicCredentialNFT contract
const contractABI = [
  "function mintCertificate(address recipient, string memory studentName, string memory degree, string memory university, string memory certificateURI) public",
  "function verifyCertificate(uint256 tokenId) public view returns (string memory studentName, string memory degree, string memory university, string memory ipfsHash)",
  "function balanceOf(address owner) external view returns (uint256 balance)",
  "function tokenOfOwnerByIndex(address owner, uint256 index) external view returns (uint256 tokenId)",
  "function ownerOf(uint256 tokenId) external view returns (address owner)",
  "function getCertificateDetails(uint256 tokenId) public view returns (string memory studentName, string memory degree, string memory university, string memory ipfsHash)",
  "function getIssuedCertificates(address issuer) public view returns (uint256[] memory)",
]

// Contract address - replace with your actual deployed contract address
const contractAddress = "0xAa35AA4dDfbB5A817F480378b45C09B7D90F2B5E"

interface Web3ContextType {
  provider: ethers.BrowserProvider | null
  signer: ethers.Signer | null
  contract: ethers.Contract | null
  address: string | null
  connectWallet: () => Promise<void>
  disconnectWallet: () => Promise<void>
  isConnecting: boolean
  chainId: number | null
  networkName: string | null
  isCorrectNetwork: boolean
  switchNetwork: () => Promise<void>
}

export const Web3Context = createContext<Web3ContextType>({
  provider: null,
  signer: null,
  contract: null,
  address: null,
  connectWallet: async () => {},
  disconnectWallet: async () => {},
  isConnecting: false,
  chainId: null,
  networkName: null,
  isCorrectNetwork: false,
  switchNetwork: async () => {},
})

// Custom network details
const REQUIRED_CHAIN_ID = 656476

export function Web3Provider({ children }: { children: ReactNode }) {
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null)
  const [signer, setSigner] = useState<ethers.Signer | null>(null)
  const [contract, setContract] = useState<ethers.Contract | null>(null)
  const [address, setAddress] = useState<string | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [chainId, setChainId] = useState<number | null>(null)
  const [networkName, setNetworkName] = useState<string | null>(null)
  const [isCorrectNetwork, setIsCorrectNetwork] = useState(false)
  const { toast } = useToast()

  // Initialize provider on client-side
  useEffect(() => {
    if (typeof window !== "undefined") {
      if (window.ethereum) {
        const provider = new ethers.BrowserProvider(window.ethereum)
        setProvider(provider)

        const checkConnection = async () => {
          try {
            const network = await provider.getNetwork()
            const chainId = Number(network.chainId)
            setChainId(chainId)
            setNetworkName(network.name)
            setIsCorrectNetwork(chainId === REQUIRED_CHAIN_ID)

            const accounts = await provider.listAccounts()
            if (accounts.length > 0) {
              const signer = await provider.getSigner()
              const address = await signer.getAddress()

              setSigner(signer)
              setAddress(address)

              if (chainId === REQUIRED_CHAIN_ID) {
                const contract = new ethers.Contract(contractAddress, contractABI, signer)
                setContract(contract)
              }
            }
          } catch (error) {
            console.error("Error checking connection:", error)
          }
        }

        checkConnection()

        const handleAccountsChanged = (accounts: string[]) => {
          if (accounts.length === 0) {
            setSigner(null)
            setAddress(null)
            setContract(null)
            toast({
              title: "Wallet disconnected",
              description: "Your wallet has been disconnected.",
              variant: "destructive",
            })
          } else {
            connectWallet()
          }
        }

        const handleChainChanged = (chainIdHex: string) => {
          const newChainId = Number.parseInt(chainIdHex, 16)
          setChainId(newChainId)
          setIsCorrectNetwork(newChainId === REQUIRED_CHAIN_ID)
          window.location.reload()
        }

        window.ethereum.on("accountsChanged", handleAccountsChanged)
        window.ethereum.on("chainChanged", handleChainChanged)

        return () => {
          window.ethereum.removeListener("accountsChanged", handleAccountsChanged)
          window.ethereum.removeListener("chainChanged", handleChainChanged)
        }
      } else {
        console.warn("MetaMask not detected")
      }
    }
  }, [toast])

  const connectWallet = async () => {
    if (!provider) {
      toast({
        title: "No provider found",
        description: "Please install MetaMask or another Web3 wallet.",
        variant: "destructive",
      })
      return
    }

    try {
      setIsConnecting(true)
      await window.ethereum.request({ method: "eth_requestAccounts" })

      const network = await provider.getNetwork()
      const chainId = Number(network.chainId)
      setChainId(chainId)
      setNetworkName(network.name)
      setIsCorrectNetwork(chainId === REQUIRED_CHAIN_ID)

      const signer = await provider.getSigner()
      const address = await signer.getAddress()

      setSigner(signer)
      setAddress(address)

      if (chainId === REQUIRED_CHAIN_ID) {
        const contract = new ethers.Contract(contractAddress, contractABI, signer)
        setContract(contract)

        toast({
          title: "Wallet connected!",
          description: `Connected to ${address.slice(0, 6)}...${address.slice(-4)}`,
        })
      } else {
        toast({
          title: "Wrong network",
          description: "Please switch to the required network.",
          variant: "destructive",
        })
      }

      return address
    } catch (error) {
      console.error("Error connecting wallet:", error)
      toast({
        title: "Connection failed",
        description: "There was an error connecting your wallet.",
        variant: "destructive",
      })
      throw error
    } finally {
      setIsConnecting(false)
    }
  }

  const disconnectWallet = async () => {
    try {
      // Clear the wallet connection state
      setSigner(null)
      setAddress(null)
      setContract(null)

      // In MetaMask, we can't programmatically disconnect
      // But we can clear our app's state

      toast({
        title: "Wallet disconnected",
        description: "Your wallet has been disconnected from the application.",
      })

      return true
    } catch (error) {
      console.error("Error disconnecting wallet:", error)
      toast({
        title: "Disconnection failed",
        description: "There was an error disconnecting your wallet.",
        variant: "destructive",
      })
      throw error
    }
  }

  const switchNetwork = async () => {
    if (!window.ethereum) {
      toast({
        title: "No provider found",
        description: "Please install MetaMask or another Web3 wallet.",
        variant: "destructive",
      })
      return
    }

    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: `0x${REQUIRED_CHAIN_ID.toString(16)}` }], // "0xa2891"
      })
    } catch (switchError: any) {
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: `0x${REQUIRED_CHAIN_ID.toString(16)}`,
                chainName: "Open Campus Codex", // Update if your network uses a different name
                nativeCurrency: {
                  name: "OCC Token", // Update if necessary
                  symbol: "OCC", // Update if necessary
                  decimals: 18,
                },
                rpcUrls: ["https://rpc.open-campus-codex.gelato.digital/"],
                blockExplorerUrls: ["https://explorer.open-campus-codex.gelato.digital/"], // Update with your network's explorer URL, if available
              },
            ],
          })
        } catch (addError) {
          console.error("Error adding network:", addError)
          toast({
            title: "Network switch failed",
            description: "Could not add the required network to your wallet.",
            variant: "destructive",
          })
        }
      } else {
        console.error("Error switching network:", switchError)
        toast({
          title: "Network switch failed",
          description: "Could not switch to the required network.",
          variant: "destructive",
        })
      }
    }
  }

  return (
    <Web3Context.Provider
      value={{
        provider,
        signer,
        contract,
        address,
        connectWallet,
        disconnectWallet,
        isConnecting,
        chainId,
        networkName,
        isCorrectNetwork,
        switchNetwork,
      }}
    >
      {children}
    </Web3Context.Provider>
  )
}

