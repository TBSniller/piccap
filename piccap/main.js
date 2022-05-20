window.onload = function()
{
	console.log("loaded");
}

function logmsg(str) {
	document.getElementById("log-window").innerText += str + "\n";
}

window.onerror = function myErrorHandler(errorMsg, url, lineNumber) {
	logmsg("[!] JS Error on line " + lineNumber + ": " + errorMsg);
	return false;
}
