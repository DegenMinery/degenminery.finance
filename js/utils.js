let marketingAndDevelopmentAddress = "0x184b23f0E1Ed0d38d721A56fCFb9ecae6Ed2FB77"

function shortenAddress(addr){
    let sliceStart = addr.slice(0, 5)
    let sliceEnd = addr.slice(addr.length - 5, addr.length, 5)
    return sliceStart + "...." + sliceEnd
}

function formatBigValue(value, decimals){
    return parseFloat(value).toFixed(decimals)
}

function copyRefToClipboard(text){
    const el = document.createElement('textarea');
    el.value = text;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
    $('.ref-button')[0].innerHTML = 'Copied!';
    setTimeout(() => {
        $('.ref-button')[0].innerHTML = "Copy Referral Link";
    }, 1000)
}

function getParameter(p){
    var url = window.location.search.substring(1);
    var varUrl = url.split('&');
    for (var i = 0; i < varUrl.length; i++)
    {
        var parameter = varUrl[i].split('=');
        if (parameter[0] == p)
        {
            return parameter[1];
        }
    }
}

function validateErcAddress(address) {
    if (typeof address !== 'string')
        return false;

    if (address[0] === "0" && address[1] === "x"&& address.length == 42)
        return true;

    return false;
}

function hashToClickableUrl(hash){
    return `<a href="`+explorerTx+hash+`" target="_blank">TX Link</a>`
}

function popupText(text, seconds){
    let countdownSecond = seconds
    let countdownInterval
    $('.popup-text')[0].innerHTML = text
    $('.popup-text')[0].innerHTML += "<br>Closing in... " + countdownSecond
    countdownInterval = setInterval(() => {
        countdownSecond--
        if(countdownSecond < 1)
        clearInterval(countdownInterval)
        $('.popup-text')[0].innerHTML = text
        $('.popup-text')[0].innerHTML += "<br>Closing in... " + countdownSecond
    }, 1000)
    $(".popup-overlay, .popup-content").addClass("active");
    $(".close, .popup-overlay").on("click", function() {
        $(".popup-overlay, .popup-content").removeClass("active");
        clearInterval(countdownInterval)
    });
    setTimeout(() => {
        $(".popup-overlay, .popup-content").removeClass("active");
    }, seconds*1000)
}