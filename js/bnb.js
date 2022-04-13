const bnbChainId = 56
const bnbTestnetId = 97
const currencyName = "bnb"
const explorerAddress = "https://bscscan.com/address/"
const explorerTx = "https://bscscan.com/tx/"

const minerAddress = bnbMinerAddress
let minerContract

let userDegens, userCoins, userRef
let sellValue

let infoInterval, sellInterval

let buyButton = '.buy-button', compoundButton = '.compound-button', sellButton = '.sell-button'

$('.contract-explorer')[0].href = explorerAddress+minerAddress

function checkForCorrectChain(id){
    initButtons()
    if(id == bnbChainId /* || id == bnbTestnetId */){
        $(".wallet-connected")[0].innerHTML = "User " + shortenAddress(userAddress) + "<br>" + "Connected to " + chainNames[chainId];
        buttonConnected()
        connectMinerContract()
        getRefLink()
        getRef()
    }else{
        $(".wallet-connector")[0].innerHTML = "Wrong Network! ("+ chainNames[id] +")<br>" + "Please connect to " + chainNames[bnbChainId];
        buttonDisconnected()
    }
}

async function connectMinerContract(){
    await (minerContract = new web3.eth.Contract(minerABI, minerAddress))
    checkIfLive()
    displayInfo()
}

async function checkIfLive(){
    let live = await minerContract.methods.isLive().call()
    if(live){
        $(".status")[0].textContent = "Contract is live!"
        $(".status")[0].style.color = "green"
    }else{
        setTimeout(checkIfLive, 500)
        $(".status")[0].textContent = "Contract is not live!"
        $(".status")[0].style.color = "red"
        console.log("Contract not live yet.")
    }
}

function initButtons(){
    if(isMobile){
        $(buyButton).on('vclick touchstart', function(){
            buyDegens()
        });
        $(compoundButton).on('vclick touchstart', function(){
            compoundCoins()
        });
        $(sellButton).on('vclick touchstart', function(){
            sellCoins()
        });
    }else{
        $(buyButton).on('click', function(){
            buyDegens()
        });
        $(compoundButton).on('click', function(){
            compoundCoins()
        });
        $(sellButton).on('click', function(){
            sellCoins()
        });
    }
}

async function displayInfo(){
    //Contract Balance
    minerContract.methods.getBalance().call().then(result => {
        const contractBal = web3.utils.fromWei(result, "ether");
        $('.contract-balance')[0].textContent = "Contract Balance " + parseFloat(contractBal).toFixed(4) + " " + currencyName.toUpperCase()
    })

    //User Balance
    web3.eth.getBalance(userAddress).then(result => {
        const bal = web3.utils.fromWei(result, "ether");
        userBalance = parseFloat(bal).toFixed(4);
        $('.user-balance')[0].innerHTML = "Your Balance " + userBalance + " " + currencyName.toUpperCase()
    })

    //Degen miners owned by the user
    minerContract.methods.getMyMiners(userAddress).call().then(result => {
        userDegens = result
        $('.degens-mining')[0].innerHTML = parseFloat(userDegens).toFixed(4);
    })

    getCoinValue()

    infoInterval = setTimeout(() => { 
        displayInfo()
    }, 4000)

}

async function getCoinValue(){
    //Coins mined by the user's degens
    await minerContract.methods.getMyCoins(userAddress).call().then(result => {
        userCoins = result
        $('.coins-found')[0].innerHTML = parseFloat(userCoins).toFixed(4);
    })

    //Value of mined coins
    if(userCoins > 0)
        minerContract.methods.coinRewards(userAddress).call().then(result => {
            sellValue = web3.utils.fromWei(result, "ether");
            $('.coin-value')[0].innerHTML = "Your coins are worth " + parseFloat(sellValue).toFixed(6) + " " + currencyName.toUpperCase()
        })
    else
        $('.coin-value')[0].innerHTML = "---"
}

async function buyDegens(){
    let input = $('.buy-input')[0].value
    if(input == undefined || input == ""){
        $(buyButton)[0].textContent = 'Input BNB';
        setTimeout(() => {
            $(buyButton)[0].textContent = "Buy Degens";
        }, 1000)
        return
    }
    let bnbAmount = web3.utils.toWei(input)

    let ref
    if(validateErcAddress(userRef))
        ref = userRef
    else 
        ref = marketingAndDevelopmentAddress

    let button = buyButton
    await minerContract.methods.buyCoins(ref).send({value: bnbAmount, from: userAddress})
    .on('transactionHash', function(hash){
        console.log(hash)
        $(button)[0].textContent = 'TX Sent';
        setTimeout(() => {
            $(button)[0].textContent = "Buy Degens";
        }, 5000)
    }).on('receipt', function(receipt){
        popupText( hashToClickableUrl(receipt.transactionHash), 10 )
    }).on('error', function(error, receipt){
        console.log(error.code)
        if(error.code == 4001){
            $(button)[0].textContent = 'TX Declined';
            setTimeout(() => {
                $(button)[0].textContent = "Buy Degens";
            }, 1500)
        }
    })
    
    console.log("Finished Buying")
    getCoinValue()
}

async function compoundCoins(){
    let ref
    if(validateErcAddress(userRef))
        ref = userRef
    else 
        ref = marketingAndDevelopmentAddress

    let button = compoundButton
    await minerContract.methods.buyDegenMinersWithCoin(ref).send({from: userAddress})
    .on('transactionHash', function(hash){
        console.log(hash)
        $(button)[0].textContent = 'TX Sent';
        setTimeout(() => {
            $(button)[0].textContent = "Buy More Degens (No Tax)";
        }, 5000)
    }).on('receipt', function(receipt){
        popupText( hashToClickableUrl(receipt.transactionHash), 10 )
    }).on('error', function(error, receipt){
        console.log(error.code)
        if(error.code == 4001){
            $(button)[0].textContent = 'TX Declined';
            setTimeout(() => {
                $(button)[0].textContent = "Buy More Degens (No Tax)";
            }, 1500)
        }
    })

    getCoinValue()
    console.log("Finished Compounding")
}

async function sellCoins(){
    let button = sellButton
    await minerContract.methods.sellCoins().send({from: userAddress})
    .on('transactionHash', function(hash){
        console.log(hash)
        $(button)[0].textContent = 'TX Sent';
        setTimeout(() => {
            $(button)[0].textContent = "Sell Your Coins (10% Tax)";
        }, 5000)
    }).on('receipt', function(receipt){
        popupText( hashToClickableUrl(receipt.transactionHash), 10 )
    }).on('error', function(error, receipt){
        console.log(error.code)
        if(error.code == 4001){
            $(button)[0].textContent = 'TX Declined';
            setTimeout(() => {
                $(button)[0].textContent = "Sell Your Coins (10% Tax)";
            }, 1500)
        }
    })

    getCoinValue()
    console.log("Finished Selling")
}
