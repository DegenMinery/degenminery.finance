const bnbChainId = 56
const bnbTestnetId = 97
const currencyName = "bnb"

const minerAddress = bnbMinerAddress
let minerContract

let userDegens, userCoins, userRef
let sellValue

let infoInterval, sellInterval

$('.contract-explorer')[0].href = "https://bscscan.com/address/"+minerAddress

function checkForCorrectChain(id){
    if(id == bnbChainId || id == bnbTestnetId){
        $(".wallet-connected")[0].innerHTML = "User " + shortenAddress(userAddress) + "<br>" + "Connected to " + chainNames[chainId];
        buttonConnected()
        connectMinerContract()
        initButtons()
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
        $('.buy-button').on('touchstart', function(){
            buyDegens()
        });
        $('.compund-button').on('touchstart', function(){
            compundCoins()
        });
        $('.sell-button').on('touchstart', function(){
            sellCoins()
        });
    }else{
        $('.buy-button').on('click', function(){
            buyDegens()
        });
        $('.compund-button').on('click', function(){
            compundCoins()
        });
        $('.sell-button').on('click', function(){
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
        $('.user-balance')[0].innerHTML = userBalance
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
    let bnbAmount = web3.utils.toWei(input)

    let ref
    if(validateErcAddress(userRef))
        ref = userRef
    else 
        ref = marketingAndDevelopmentAddress

    await minerContract.methods.buyCoins(ref).send({value: bnbAmount, from: userAddress})
    console.log("Finished Buying")
    getCoinValue()
}

async function compoundCoins(){
    let ref
    if(validateErcAddress(userRef))
        ref = userRef
    else 
        ref = marketingAndDevelopmentAddress

    await minerContract.methods.buyDegenMinersWithCoin(ref).send({from: userAddress})
    getCoinValue()
    console.log("Finished Compounding")
}

async function sellCoins(){
    await minerContract.methods.sellCoins().send({from: userAddress})
    getCoinValue()
    console.log("Finished Selling")
}

function getRefLink(){
    let url = window.location.href.split('?')[0];
    let refLink = url+"?ref="+userAddress
    console.log("Referral Link: " + refLink)
    $('.ref-link')[0].innerHTML = `<button class="ref-button" onclick="copyRefToClipboard('`+refLink+`')">Copy Referral Link</button>`
}

function getRef(){
    userRef = getParameter("ref")
    console.log(userRef)
    if(userRef == undefined)
    userRef = marketingAndDevelopmentAddress
    else if(!validateErcAddress(userRef)){
        userRef = marketingAndDevelopmentAddress
        $('.user-ref')[0].textContent = "Ref address invalid, default address set."
    }else if(userRef == userAddress){
        $('.user-ref')[0].textContent = "Cannot self-refer, default address set."
    }else
        $('.user-ref')[0].textContent = "Your referral: " + shortenAddress(userRef)
    console.log("User Ref: " + userRef)
}

