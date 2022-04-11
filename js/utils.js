let marketingAndDevelopmentAddress = "0x5591A024717515AB2De602A47d568C4ebe733596"

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