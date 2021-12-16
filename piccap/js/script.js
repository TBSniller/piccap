/*
HTML IDs
ip			              - Textinput IP
port  		              - Textinput Port
startdelay	              - Textinput Delay to start video capture
width			          - Textinput Capture width
height		      	      - Textinput Capture height
fps		          	      - Textinput Capture FPS

radioold	       	      - Radio Old TV (libvt + libgm)
radionew	    	      - Radio New 2020+ TV (libvtcapture + libhalgal)

videocapture	          - Checkbox video capture
graphiccapture  	      - Checkbox graphic capture
autostart		          - Checkbox Autostart

servicestatus	          - Text Status Service
permissionstatus          - Text Status Permissions (libvtcapture)

OnClick-Functions
save()		              - Btn Save
loadconf()                - Btn Load configuration
stopservice()	          - Btn Stop Service
startservice()	       	  - Btn Start Service
restart()	              - Btn Restart Service (force new perms)
resetconf()		          - Btn Reset configuration 
*/

//default settings
let ip = '192.168.178.2',
port = 19400,
startdelay = '30',
width = 360,
height = 180,
fps = 0,
lib = 'new',
videocapture =  '1',
graphiccapture = '0',
autostart = '0';
//
let loadingcounter;
startup();

async function startup(){
    console.log("Starting application.. Waiting for service getting ready..");
    await sleep(7000);
    loadconf();
}

async function restart(){
    console.log("Trying to restart service..");
    document.getElementById("servicestatus").innerHTML = "Restarting service..";
    webOS.service.request("luna://org.webosbrew.piccap.service/", {
        method: "restart",
        onFailure: showErrorService,
        onComplete: showSuccServiceSetPerms
    });
}

async function resetconf(){
    console.log("Resetting configuration.. Calling resetSettings from service.");
    webOS.service.request("luna://org.webosbrew.piccap.service/", {
        method: "resetSettings",
        onFailure: showErrorService,
        onComplete: makeSuccServiceSettingreset
    });
}

function rootStatus(){
    console.log("Getting root status from service");
    webOS.service.request("luna://org.webosbrew.piccap.service/", {
        method: "isRoot",
        onFailure: showErrorService,
        onComplete: showSuccServiceRoot
    });
}

function loadconf(){
    loadingcounter = 0;
    console.log("Loading configuration.. Calling getSettings from service.");
    document.getElementById("servicestatus").innerHTML = "Loading configuration..";
    webOS.service.request("luna://org.webosbrew.piccap.service/", {
        method: "getSettings",
        onFailure: showErrorService,
        onComplete: makeSuccServiceLoad
    });

    document.getElementById("servicestatus").innerHTML = "Checking servicestatus..";
    webOS.service.request("luna://org.webosbrew.piccap.service/", {
        method: "isRunning",
        onFailure: showErrorService,
        onComplete: showSuccServiceisStarted
    });

    rootStatus();
}

function save(){
    document.getElementById("servicestatus").innerHTML = "Saving..";

    ip = document.getElementById("ip").value;
    port = +document.getElementById("port").value;
    // startdelay = document.getElementById("startdelay").value;
    width = +document.getElementById("width").value;
    height = +document.getElementById("height").value;
    fps = +document.getElementById("fps").value;

    if (document.getElementById("radionew").checked){
        lib = "libvtcapture";
    }else if(document.getElementById("radioold").checked){
        lib = "libvt";
    }else{
        lib = "libdile_vt";
    }
   
    if(document.getElementById("videocapture").checked){
        videocapture = false;
    }else{
        videocapture = true;
    }

    if(document.getElementById("graphiccapture").checked){
        graphiccapture = false;
    }else{
        graphiccapture = true;
    }

    if(document.getElementById("autostart").checked){
        autostart = true;
    }else{
        autostart = false;
    }

    webOS.service.request("luna://org.webosbrew.piccap.service/", {
        method: "setSettings",
        parameters: {address: ip,
        port: port,
        // startdelay: startdelay,
        width: width,
        height: height,
        fps: fps,
        backend: lib,
        novideo:  videocapture,
        nogui: graphiccapture,
        autostart: autostart},
        onFailure: showErrorService,
        onComplete: showSuccServiceSet
    }); 
    
}

function startservice()
{
    document.getElementById("servicestatus").innerHTML = "Starting with delay..";
    webOS.service.request("luna://org.webosbrew.piccap.service/", {
        method: "start",
        onFailure: showErrorService,
        onComplete: showSuccServiceisStarted
    });
}

function stopservice()
{
    document.getElementById("servicestatus").innerHTML = "Stopping..";
    webOS.service.request("luna://org.webosbrew.piccap.service/", {
        method: "stop",  
        onFailure: showErrorService,
        onComplete: showSuccServiceisStarted
    });
  
}

function showErrorService(err){
    document.getElementById("servicestatus").innerHTML = "Error: " + err.toString();
    console.log("Error while contacting service!");
}

function showSuccServiceisStarted(resp){
    document.getElementById("servicestatus").innerHTML = "Capture running: " + resp.isRunning;
    console.log("Got servicestatus successfully!");
}

function showSuccServiceSet(resp){
    document.getElementById("servicestatus").innerHTML = resp.backmsg;
    if (resp.isSet){
        console.log("Settings set successfully! Calling save..");
        webOS.service.request("luna://org.webosbrew.piccap.service/", {
            method: "saveSettings",
            onFailure: showErrorService,
            onComplete: showSuccServiceSave
        });
        return;
    }
    console.log("Settings not set correctly!");
}

function showSuccServiceSave(resp){
    document.getElementById("servicestatus").innerHTML = resp.backmsg;
    console.log("Settings saved successfully called!");
}


function showSuccServiceRoot(resp){
    document.getElementById("servicestatus").innerHTML = resp.backmsg;
    document.getElementById("permissionstatus").innerHTML = resp.backmsg;
//    if (!resp.isRoot){
//        document.getElementById("result1").innerHTML = "Background service not running as root. Please reboot your TV, to let HBChannel elevating take affect. No powercycle - Full reboot! Will add button some time later..";
//    }
    console.log("Get root status successfully called!");
}


function makeSuccServiceSettingreset(resp){
    document.getElementById("servicestatus").innerHTML = resp.backmsg;
    if (resp.isReset){
        console.log("Settings reset successfully! Calling configuration reload..");
        loadconf();
        return;
    }
    console.log("Settings not reset correctly! Reloading anyways..");
    loadconf();
}

function showSuccServiceSetPerms(resp){
    document.getElementById("permissionstatus").innerHTML = resp.backmsg;
    document.getElementById("servicestatus").innerHTML = "Status got.";
    console.log("Restart successfully called!");
}

async function makeSuccServiceLoad(resp){
    await sleep(1000);
    if (!resp.loaded || typeof resp.autostart === 'undefined'){ //|| Check if last possible var is set
        loadingcounter++;
        console.log("Service not fully loaded yet. loaded: " + resp.loaded + " Last var: " + resp.autostart + " Trying again... Trynumber: " + loadingcounter);
        webOS.service.request("luna://org.webosbrew.piccap.service/", {
            method: "getSettings",
            onFailure: showErrorService,
            onComplete: makeSuccServiceLoad //Just call me again..
        });
        return;
    }

    document.getElementById("servicestatus").innerHTML = resp.backmsg;
    document.getElementById("ip").value = resp.address;
    document.getElementById("port").value = resp.port;
//    document.getElementById("startdelay").value = resp.startdelay;
    document.getElementById("width").value = resp.width;
    document.getElementById("height").value = resp.height;
    document.getElementById("fps").value = resp.fps;

    if (resp.backend == "libvt"){
        document.getElementById("radioold").checked = true;
        document.getElementById("radionew").checked = false;
    }else{
        document.getElementById("radionew").checked = true;
        document.getElementById("radioold").checked = false;
    }
   
    if(resp.novideo == false){
        document.getElementById("videocapture").checked = true;
    }else{
        document.getElementById("videocapture").checked = false;
    }

    if(resp.nogui == false){
        document.getElementById("graphiccapture").checked = true;
    }else{
        document.getElementById("graphiccapture").checked = false;
    }

    if(resp.autostart == true){
        document.getElementById("autostart").checked = true;
    }else{
        document.getElementById("autostart").checked = false;
    }

    console.log("Settings loaded successfully! Got the following settings: IP: " + resp.address + " Port: " + resp.port + " Width: " + resp.width + " Height: " + resp.height + " FPS: " + resp.fps + " Lib: " + resp.backend + " Videocapture: " + resp.novideo + " Graphiccapture: " + resp.nogui + " Autostart: " + resp.autostart);
}
 
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
