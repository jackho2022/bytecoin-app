import { useState, useEffect } from "react";
import { ethers, utils } from "ethers";
import abi from "./contracts/ByteCoin.json";

function App() {
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [inputValue, setInputValue] = useState({ transferToAddress: "", transferAmount: "", burnAmount: "", mintAmount: "" });
  const [tokenName, setTokenName] = useState("");
  const [tokenSymbol, setTokenSymbol] = useState("");
  const [tokenTotalSupply, setTokenTotalSupply] = useState(0);
  const [isTokenOwner, setIsTokenOwner] = useState(false);
  const [tokenOwnerAddress, setTokenOwnerAddress] = useState(null);
  const [connectedAddress, setConnectedAddress] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const contractAddress = '0x8c68bA91541b9F8F555136200888159fB2C678CF';
  const contractABI = abi.abi;

  const checkIfWalletIsConnected = async () => {
    try {
      if (window.ethereum) {
        setIsLoading(true);
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setIsLoading(false);
        const account = accounts[0];
        setIsWalletConnected(true);
        setConnectedAddress(account);
        console.log("User Account Connected: ", account);
      } else {
        setError("Please install a MetaMask wallet to use our bank.");
        console.log("No Metamask detected");
      }      
    } catch (error) {
      setIsLoading(false);
      console.log(error);
    }
  }

  const getTokenInfoHandler = async () => {
    try {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const tokenContract = new ethers.Contract(contractAddress, contractABI, signer);
        setIsLoading(true);
        const [account] = await window.ethereum.request({ method: 'eth_requestAccounts' });
        let tokenName = await tokenContract.name();
        let tokenSymbol = await tokenContract.symbol();
        let tokenOwner = await tokenContract.owner();
        let tokenSupply = await tokenContract.totalSupply();
        tokenSupply = utils.formatEther(tokenSupply);
        setIsLoading(false);

        setTokenName(`${tokenName}😁`); 
        setTokenSymbol(tokenSymbol);
        setTokenTotalSupply(tokenSupply);
        setTokenOwnerAddress(tokenOwner);

        if (tokenOwner.toLowerCase() === account.toLowerCase()) {
          setIsTokenOwner(true);
        }
      } else {
        console.log("Ethereum object not found, install Metamask.");
        setError("Please install a MetaMask wallet to use our bank.");
      }
    } catch (error) {
      setIsLoading(false);
      console.log(error)
    }
  }

  
  const handleInputChange = (event) => {
    setInputValue(prevFormData => ({ ...prevFormData, [event.target.name]: event.target.value }));
  }

  const transferTokenHandler = async (event) => {
    try {
      event.preventDefault();
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const tokenContract = new ethers.Contract(contractAddress, contractABI, signer);
        setIsLoading(true);
        const txn = await tokenContract.transfer(inputValue.walletAddress, ethers.utils.parseEther(inputValue.transferAmount));
        console.log("Transfering tokens...");
        await txn.wait();
        setIsLoading(false);
        console.log("Tokens Transfered", txn.hash);
      } else {
        console.log("Ethereum object not found, install Metamask.");
        setError("Please install a MetaMask wallet to use our bank.");
      }
    } catch (error) {
      setIsLoading(false);
      console.log(error)
    }
  }

  const burnTokenHandler = async (event) => {
    try {
      event.preventDefault();
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const tokenContract = new ethers.Contract(contractAddress, contractABI, signer);
        setIsLoading(true);
        const txn = await tokenContract.burn(ethers.utils.parseEther(inputValue.burnAmount));
        console.log("Burning Tokens...");
        await txn.wait();
        console.log("Tokens burned...", txn.hash);
        let tokenSupply = await tokenContract.totalSupply();
        tokenSupply = utils.formatEther(tokenSupply);
        setTokenTotalSupply(tokenSupply);
        setIsLoading(false);
      } else {
        console.log("Ethereum object not found, install Metamask.");
        setError("Please install a MetaMask wallet to use our bank.");
      }
    } catch (error) {
      setIsLoading(false);
      console.log(error)
    }
  }

  const mintTokenHandler = async (event) => {
    try {
      event.preventDefault();
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const tokenContract = new ethers.Contract(contractAddress, contractABI, signer);
        setIsLoading(true);
        let tokenOwner = await tokenContract.owner();
        const txn = await tokenContract.mint(tokenOwner, ethers.utils.parseEther(inputValue.mintAmount));
        console.log("Minting Tokens...");
        await txn.wait();
        console.log("Tokens minted...", txn.hash);
        let tokenSupply = await tokenContract.totalSupply();
        tokenSupply = utils.formatEther(tokenSupply);
        setTokenTotalSupply(tokenSupply);
        setIsLoading(false);
      } else {
        console.log("Ethereum object not found, install Metamask.");
        setError("Please install a MetaMask wallet to use our bank.");
      }
    } catch (error) {
      setIsLoading(false);
      console.log(error)
    }
  }  

  useEffect(() => {
    checkIfWalletIsConnected();
    getTokenInfoHandler();
  }, [isWalletConnected]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <main className="main-container">
      <h2 className="headline"><span className="headline-gradient">Byte Coin Project</span> 🪙</h2>
      <section className="customer-section px-10 pt-5 pb-10">
        {isLoading && <p className="text-2xl text-yellow-700">Loading</p>}
        {error && <p className="text-2xl text-red-700">{error}</p>}
        <div className="mt-7 mb-9 columns-3">
          <div><span className="font-bold">Coin: </span>{tokenName}</div>
          <div><span className="font-bold">Ticker: </span>{tokenSymbol}</div>
          <div><span className="font-bold">Total Supply: </span>{tokenTotalSupply}</div>
        </div>
        <div className="mt-7 mb-9"> 
          <form className="form-style">
            <input
              type="text"
              className="input-style"
              onChange={handleInputChange}
              name="transferToAddress"
              placeholder="Wallet Address"
              value={inputValue.transferTotAddress}
            />            
            <input
              type="text"
              className="input-style"
              onChange={handleInputChange}
              name="transferAmount"
              placeholder={`0.0000 ${tokenSymbol}`}
              value={inputValue.transferAmount}
            />              
            <button
              className="btn-green"
              onClick={transferTokenHandler}>
              Transfer Tokens</button>
          </form>
        </div>
        {isTokenOwner && (
          <section>
        <div className="mt-10 mb-10">
          <form className="form-style">
            <input
              type="text"
              className="input-style"
              onChange={handleInputChange}
              name="burnAmount"
              placeholder={`0.0000 ${tokenSymbol}`}
              value={inputValue.burnAmount}
            />  
           <button
              className="btn-green"
              onClick={burnTokenHandler}>
              Burn Tokens
            </button>
          </form>
        </div>
        <div className="mt-10 mb-10">
          <form className="form-style">
            <input
              type="text"
              className="input-style"
              onChange={handleInputChange}
              name="mintAmount"
              placeholder={`0.0000 ${tokenSymbol}`}
              value={inputValue.mintAmount}
            />  
           <button
              className="btn-green"
              onClick={mintTokenHandler}>
              Mint Tokens
            </button>
          </form>
        </div>
          </section>
        )}
        <div className="mt-5">
          <p><span className="font-bold">Contract Address: </span>{contractAddress}</p>
        </div>
        <div className="mt-5">
          <p><span className="font-bold">Token Owner Address: </span>{tokenOwnerAddress}</p>
        </div>
        <div className="mt-5">
          {isWalletConnected && <p><span className="font-bold">Your Wallet Address: </span>{connectedAddress}</p>}
          <button className="btn-connect" onClick={checkIfWalletIsConnected}>
            {isWalletConnected ? "Wallet Connected 🔒" : "Connect Wallet 🔑"}
          </button>
        </div>
      </section>
    </main>
  );
}

export default App;
