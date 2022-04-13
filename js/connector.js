"use strict";

// Unpkg imports
const Web3Modal = window.Web3Modal.default;
const WalletConnectProvider = window.WalletConnectProvider.default;
const evmChains = window.evmChains;

let web3Modal
let web3
let connectedProvider
let userAddress, userBalance
let chainId, chainData
let chainNames = {
    '1': "Ethereum Mainnet",
    '56': "BNB Chain",
    '97': "BNB Testnet",
    '43114': "Avalanche C-Chain",
    '250': "Fantom Opera",
    '137': "Polygon Mainnet",
    '25': "Cronos Mainnet"
}
let isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
console.log("Mobile: " + isMobile)

window.addEventListener('load', async () => {
    if(isMobile){
        $(".wallet-connector").on("vclick touchstart", onConnect);
        $(".wallet-connected").on("vclick touchstart", onDisconnect);
    }else{
        $(".wallet-connector").on("click", onConnect);
        $(".wallet-connected").on("click", onDisconnect);
    }
    init();
});

async function checkAlreadyConnected() {
    const providerOptions = {
        walletconnect: {
            package: WalletConnectProvider
        }
    };
    web3Modal = new Web3Modal({
        cacheProvider: false, // optional
        providerOptions, // required
        disableInjectedProvider: false, // optional. For MetaMask / Brave / Opera.
    });

    try {
        connectedProvider = await web3Modal.connect();
        console.log("Connected prior. Resuming connection.")
        return true;
    } catch (e) {
        console.log("Could not get a wallet connection", e);
        return false;
    }
    
}

async function init() {
    let isConnected = await checkAlreadyConnected()
    if(isConnected){
        fetchAccountData()
    }

    const providerOptions = {
        walletconnect: {
            package: WalletConnectProvider,
            options: {
                infuraId: "9abf459c5ae3450baa6e699af972362b",
            }
        }
    };

    web3Modal = new Web3Modal({
        cacheProvider: false, // optional
        providerOptions, // required
        disableInjectedProvider: false, // optional. For MetaMask / Brave / Opera.
    });

    if(isMobile){
        await onDisconnect()
        fetchAccountData()
    }

    console.log("Web3Modal instance is", web3Modal);
}

async function fetchAccountData() {
    web3 = new Web3(connectedProvider);

    console.log("Web3 instance is", web3);

    chainId = await web3.eth.getChainId();
    chainData = evmChains.getChain(chainId);
    console.log(chainData.shortName.toUpperCase() + " on " + chainData.name);

    const accounts = await web3.eth.getAccounts();

    userAddress = accounts[0];

    if (userAddress != undefined) {
        $(".wallet-connected")[0].innerHTML = userAddress + "<br>" + "Connected to: " + chainNames[chainId];
        buttonConnected()
        checkForCorrectChain(chainId)
    } else
        buttonDisconnected()
}

async function refreshAccountData() {
    await fetchAccountData(connectedProvider);
}

async function onConnect() {
    try {
        connectedProvider = await web3Modal.connect();
    } catch (e) {
        console.log("Could not get a wallet connection", e);
        return;
    }
    connectedProvider.on("accountsChanged", (accounts) => {
        fetchAccountData();
    });
    connectedProvider.on("chainChanged", (chainId) => {
        fetchAccountData();
    });
    connectedProvider.on("networkChanged", (networkId) => {
        fetchAccountData();
    });
    await refreshAccountData();
}

async function onDisconnect() {

    if (connectedProvider.close) {
        await connectedProvider.close();
        await web3Modal.clearCachedProvider();
        connectedProvider = null;
    }
    userAddress = null;

    $(".wallet-connector")[0].textContent = "Connect Wallet"
    buttonDisconnected()
}

function buttonDisconnected() {
    $(".wallet-connected")[0].style.display = "none";
    $(".wallet-connector")[0].style.display = "";
}

function buttonConnected() {
    $(".wallet-connector")[0].style.display = "none";
    $(".wallet-connected")[0].style.display = "";
}