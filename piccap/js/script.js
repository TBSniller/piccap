function start()
{
    var tmp = document.getElementById("input").value;
    var request = webOS.service.request("luna://com.tbsniller.piccap.service/", {
        method:"start",
        parameters: {name: tmp},    
        onFailure: showFailure,
        onComplete: showResponse,
    //  subscribe = false,
    //  resubscribe = false
    });
}
 
function getLog()
{
    var tmp = document.getElementById("input").value;
    var request = webOS.service.request("luna://com.tbsniller.piccap.service/", {
        method:"log",
        parameters: {name: tmp},    
        onFailure: showFailure,
        onComplete: showResponse,
    //  subscribe = false,
    //  resubscribe = false
    });
}

function stop()
{
    var tmp = document.getElementById("input").value;
    var request = webOS.service.request("luna://com.tbsniller.piccap.service/", {
        method:"stop",
        parameters: {name: tmp},    
        onFailure: showFailure,
        onComplete: showResponse,
    //  subscribe = false,
    //  resubscribe = false
    });
}
 
function showResponse(inResponse)   {
    if(inResponse.returnValue) {
        document.getElementById("result1").innerHTML += inResponse.data;     
        document.getElementById("result2").innerHTML = "Service Responded";     
    }
    else {
        document.getElementById("result1").innerHTML += "Failed!";
    }
    return true;
}
 
function showFailure(inError){
    document.getElementById("result1").innerHTML += "Failed!";
}
