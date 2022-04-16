
let countdownTimer = setInterval(function time() {
	let d = new Date(),
		hours = 20 - d.getUTCHours(),
		min = 59 - d.getUTCMinutes(),
		sec = 59 - d.getUTCSeconds()

        if(hours < 0){
            $('.countdown')[0].innerHTML = "Will be live anytime in the next " + zeroPrefix(min-30) + " minutes"
        }else{
		    $('.countdown')[0].innerHTML = "30 minute launch <i>window</i> starts in " + zeroPrefix(hours) + 'h:' + zeroPrefix(min) + 'm:' + zeroPrefix(sec) + "s"
        }

}, 1000);

function zeroPrefix(val) {
	if ((val.toString()).length < 2) {
		val = '0' + val;
	}
	return val;
}