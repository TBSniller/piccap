/*
HTML IDs
ip			                - Textinput IP
port  		              - Textinput Port
startdelay	            - Textinput Delay to start capture
width			              - Textinput Capture width
height		      	      - Textinput Capture height
fps		          	      - Textinput Capture FPS

radioold	       	      - Radio Old TV (libvt + libgm)
radionew	    	        - Radio New 2020+ TV (libvtcapture + libhalgal)

videocapture	          - Checkbox video capture
graphiccapture  	      - Checkbox graphic capture
autostart		            - Checkbox Autostart

servicestatus	        	- Text Status Service
permissionstatus      	- Text Status Permissions (libvtcapture)

save()		            	- Btn Save
loadconf()              - Btn Load configuration
stopservice()	        	- Btn Stop Service
startservice()	       	- Btn Start Service
setlibvtcaptureperms()	- Btn libvtcapture permission
resetconf()		          - Btn Reset configuration
*/

const pkgInfo = require('./package.json');
const Service = require('webos-service');
const service = new Service(pkgInfo.name);

const regeneratorRuntime = require("regenerator-runtime");
const fsSync = require('fs');
const {Promise} = require('bluebird');

const readFile = Promise.promisify(fsSync.readFile);
const writeFile = Promise.promisify(fsSync.writeFile);
const unlinkFile = Promise.promisify(fsSync.unlink);
const accessFile = Promise.promisify(fsSync.access);

//Default settings
let dip = "192.168.178.2";
let dport = 19400;
let dstartdelay = 30;
let dwidth = 360;
let dheight = 180;
let dfps = 0;
let dlib = "new";
let dvideocapture = 1;
let dgraphiccapture = 1;
let dautostart = 0;
//

let ip;
let port;
let startdelay;
let width;
let height;
let fps;
let lib;
let videocapture;
let graphiccapture;
let autostart;

var availableFlags = {
    ip: 'piccap_ip',
    port: 'piccap_port',
    startdelay: 'piccap_startdelay',
    width: 'piccap_capture_width',
    height: 'piccap_capture_height',
    fps: 'piccap_fps',
    lib: 'piccap_used_library',
    videocapture: 'piccap_video_capture',
    graphiccapture: 'piccap_graphic_capture',
    autostart: 'piccap_autostart',
};

let libvtcapturepath = "/media/developer/apps/usr/palm/services/org.webosbrew.piccap.service/hyperion-webos_libvtcapture";
let libvtpath = "/media/developer/apps/usr/palm/services/org.webosbrew.piccap.service/hyperion-webos_libvt";

let setloaded = false;
let started = false;
let isRoot = false;
let hasCapturePerms = false;
let capturePermsNeeded = false;
let setcounter = 0;
let scriptrun = false;

startup();

async function startup(){
  console.log("Service is starting up..");

  await checkRoot();
  if (!isRoot){
    console.log("Not running as root. Trying to evaluate using HBChannel..");
    service.call("luna://org.webosbrew.hbchannel.service/exec", {"command":"/media/developer/apps/usr/palm/services/org.webosbrew.hbchannel.service/elevate-service org.webosbrew.piccap.service"}, function(message) {
      console.log("HBChannel exec returns: " + message.payload.stdoutString);
      running = true;
    });
    console.log("Also assuming first start. Copy autostart script to HBChannel-init.d...");
    service.call("luna://org.webosbrew.hbchannel.service/exec", {"command":"mkdir -p /var/lib/webosbrew/init.d; cp /media/developer/apps/usr/palm/services/org.webosbrew.piccap.service/piccap_autostart.sh /var/lib/webosbrew/init.d/piccap_autostart.sh; chmod +x /var/lib/webosbrew/init.d/piccap_autostart.sh"}, function(message) {
      console.log("HBChannel exec returns: " + message.payload.stdoutString);
      running = true;
    });
  }else{
    console.log("Service is running as root!");
  }

  await loadSettings();
  if (isRoot){
    await areCapturePermsNeeded();
    if (capturePermsNeeded) {
      await getCapturePermsStatus();
      if (!hasCapturePerms){
        await doPermScript();
      }
    }
    if (autostart == "1"){
      console.log("Autostart enabled! Checking if Hyperion-WebOS has to be started..");
      //Do autostart things
      await startService();
    }
  }else{
    console.log("Not running as root. Skipping root-things! Configuration will be default.");
  }
  console.log("Startup finished!");
}

async function checkRoot(){
  if (process.getuid() === 0){
    isRoot = true;
  } else {
    isRoot = false;
    console.log("UID: " + process.getuid());
  }
  console.log("Root status is: " + isRoot);
}

async function getRootStatus(message){
  console.log("Getting root and permission status..");
  var perm = "Not needed";
  await checkRoot();
  await getCapturePermsStatus();
  await areCapturePermsNeeded();
  if (capturePermsNeeded){
    perm = "Needed";
    if (hasCapturePerms){
      perm = "Enforced";
    }
  }
  message.respond({
    returnValue: true,
    rootStatus: isRoot,
    permStatus: perm,
    data: "Got root status!"
  });
}

 function flagPath(flag) {
  for (var fl in availableFlags){
    if (fl == flag){
      return "/var/luna/preferences/" + availableFlags[fl];
    };
  }
  return "flagnotfound";
}

async function flagRead(flag) {
  var fread = flagPath(flag);
  if (fread == "flagnotfound"){
    return "flagnotfound";
  }
  try{
    fread = await readFile(flagPath(flag), "utf-8");
  } catch(e) {
    fread = "filenotfound"
  }
  return fread;
}

async function flagSave(flag, data) {
  var fsave = flagPath(flag);
  if (fsave == "flagnotfound"){
    return "flagnotfound";
  }
  try{
    await writeFile(fsave, data, "utf-8");
    fsave = "ok";
  } catch(e) {
    console.log(e);
    fsave = e;
  }
  return fsave;
}

async function flagUnlink(flag) {
  var funlink = flagPath(flag);
  if (funlink == "flagnotfound"){
    return "flagnotfound";
  }
  try{
    await unlinkFile(funlink);
    funlink = "ok"
  } catch(e) {
    funlink = e;
  }
  return funlink;
}

async function loadSettings() {
  console.log("Loading configuration from filesystem..");
  ip = await flagRead("ip");
  if (ip == "flagnotfound" || ip == "filenotfound" || ip == "undefined") ip = dip;

  port = await flagRead("port");
  if (port == "flagnotfound" || port == "filenotfound" || port == "undefined") port = dport;
  
  startdelay = await flagRead("startdelay");
  if (startdelay == "flagnotfound" || startdelay == "filenotfound" || startdelay == "undefined") startdelay = dstartdelay;
  
  width = await flagRead("width");
  if (width == "flagnotfound" || width == "filenotfound" || width == "undefined") width = dwidth;

  height = await flagRead("height");
  if (height == "flagnotfound" || height == "filenotfound" || height == "undefined") height = dheight;

  fps = await flagRead("fps");
  if (fps == "flagnotfound" || fps == "filenotfound" || fps == "undefined") fps = dfps;

  lib = await flagRead("lib");
  if (lib == "flagnotfound" || lib == "filenotfound" || lib == "undefined") lib = dlib;

  videocapture = await flagRead("videocapture");
  if (videocapture == "flagnotfound" || videocapture == "filenotfound" || videocapture == "undefined") videocapture = dvideocapture;

  graphiccapture = await flagRead("graphiccapture");
  if (graphiccapture == "flagnotfound" || graphiccapture == "filenotfound" || graphiccapture == "undefined") graphiccapture = dgraphiccapture;

  autostart = await flagRead("autostart");
  if (autostart == "flagnotfound" || autostart == "filenotfound" || autostart == "undefined") autostart = dautostart;

  console.log("IP: " + ip + " Port: " + port + " Startdelay: " + startdelay + " Width: " + width + " Height: " + height + " FPS: " + fps + " Lib: " + lib + " Videocapture: " + videocapture + " Graphiccapture: " + graphiccapture + " Autostart: " + autostart);
  setloaded = true;
}

async function setSettings(message){
  console.log("Setting settings from application..");
  if (message.payload) {
    //TODO: False value handling
    ip = message.payload.ip;
    port = message.payload.port;
    startdelay = message.payload.startdelay;
    width = message.payload.width;
    height = message.payload.height;
    fps = message.payload.fps;
    lib = message.payload.lib;
    videocapture = message.payload.videocapture;
    graphiccapture = message.payload.graphiccapture;
    autostart = message.payload.autostart;
  }
  console.log("IP: " + ip + " Port: " + port + " Startdelay: " + startdelay + " Width: " + width + " Height: " + height + " FPS: " + fps + " Lib: " + lib + " Videocapture: " + videocapture + " Graphiccapture: " + graphiccapture + " Autostart: " + autostart);
  message.respond({
      returnValue: true,
      isSet: true,
      data: "Settings set!"
  });
}

async function saveSettings(message){
  console.log("Saving settings..");
  var out;
  var error = "no";

  out = await flagSave("ip", ip);
  if (out != "ok") {
    console.log("Settingsfile ip failed to save. Error: " + out);
    error = "yes";
  }

  out = await flagSave("port", port);
  if (out != "ok"){
    console.log("Settingsfile port failed to save. Error: " + out);
    error = "yes";
  } 

  out = await flagSave("startdelay", startdelay);
  if (out != "ok") {
    console.log("Settingsfile startdelay failed to save. Error: " + out);
    error = "yes";
  }

  out = await flagSave("width", width);
  if (out != "ok") {
    console.log("Settingsfile width failed to save. Error: " + out);
    error = "yes";
  }

  out = await flagSave("height", height);
  if (out != "ok") {
    console.log("Settingsfile height failed to save. Error: " + out);
    error = "yes";
  } 

  out = await flagSave("fps", fps);
  if (out != "ok") {
    console.log("Settingsfile fps failed to save. Error: " + out);
    error = "yes";
  }

  out = await flagSave("lib", lib);
  if (out != "ok") {
    console.log("Settingsfile lib failed to save. Error: " + out);
    error = "yes";
  }

  out = await flagSave("videocapture", videocapture);
  if (out != "ok") {
    console.log("Settingsfile videocapture failed to save. Error: " + out);
    error = "yes";
  } 

  out = await flagSave("graphiccapture", graphiccapture);
  if (out != "ok") {
    console.log("Settingsfile graphiccapture failed to save. Error: " + out);
    error = "yes";
  }

  out = await flagSave("autostart", autostart);
  if (out != "ok") {
    console.log("Settingsfile autostart failed to save. Error: " + out);
    error = "yes";
  }

  if (error == "yes"){
    message.respond({
      returnValue: true,
      data: "Settings saved with errors!"
    });
    return;
  }else{
    message.respond({
      returnValue: true,
      data: "Settings saved!"
    });
  }

}

async function resetSettings(message) {
  console.log("Resetting settings..");
  var out;
  var error = "no";

  for (var f1 in availableFlags){
    out = await flagUnlink(f1);
    if (out != "ok") console.log("Settingsfile " + f1 + " not deleted. Error: " + out);
    error = "yes";
  }
  setloaded = false;
  await loadSettings();

  if (error == "yes"){
    message.respond({
      returnValue: true,
      isReset: false,
      data: "Settings reset with errors!"
    });
  }else{
    message.respond({
      returnValue: true,
      isReset: true,
      data: "Settings reset!"
    });
  }
}

async function hyperionstart(){
  var execparameter = " -a " + ip + " -p " + port + " -x " + width + " -y " + height;
  var hbcapturestartcmd = libvtpath + execparameter;

  if (videocapture == "0"){
    execparameter = execparameter + " -V";
  }
  if (graphiccapture == "0"){
    execparameter = execparameter + " -G";
  }

  if (lib == "new") {
    hbcapturestartcmd = libvtcapturepath + execparameter;
  }

  service.call("luna://org.webosbrew.hbchannel.service/exec", 
  {
    "command": hbcapturestartcmd
  }, 
  function(message) {
    console.log("HBChannel exec returns: " + message.payload.stdoutString);
    console.log("HBChannel exec stderr returns: " + message.payload.stderrString);
    console.log("Hyperion-WebOS stopped!");
    started = false;
  });
  started = true;
  console.log("Hyperion-WebOS start command fired!");
}

async function hyperionstop(){
  var hbcapturestopcmd = "pidof -s hyperion-webos_libvt | xargs kill -SIGTERM";

  if (lib == "new") {
    hbcapturestopcmd = "pidof -s hyperion-webos_libvtcapture | xargs kill -SIGTERM";
  }

  service.call("luna://org.webosbrew.hbchannel.service/exec", 
  {
    "command": hbcapturestopcmd
  }, 
  function(message) {
    console.log("HBChannel exec returns: " + message.payload.stdoutString);
    console.log("HBChannel exec stderr returns: " + message.payload.stderrString);
    console.log("Hyperion-WebOS stopped!");
    started = false;
  });
  console.log("Hyperion-WebOS stop command fired!");

}

async function startService() {
  await isHyperionStarted();
  if (started) {
    console.log("Service already started!");
    return;
  }
  if (startdelay > 0){
    console.log("Startdelay set to: " + startdelay + ". Waiting..");
    var ttw = startdelay*1000;
    await sleep(ttw);
    console.log("Waiting for startdelay finished.");
  }
  await hyperionstart();
}

async function stopService() {
  await isHyperionStarted();
  console.log("Stopping service..");
  if (!started) {
    console.log("Service isn't running!");
    return;
  }
  await hyperionstop();
}

async function isHyperionStarted(){
  setcounter = 0;
  scriptrun = false;
  console.log("Checking hyperion-webos runstate..");
  service.call("luna://org.webosbrew.hbchannel.service/exec", {
    "command":"/bin/bash /media/developer/apps/usr/palm/services/org.webosbrew.piccap.service/isStarted.sh"
  }, function(message) {
    console.log("HBChannel exec returns: " + message.payload.stdoutString);
    console.log("HBChannel exec stderr returns: " + message.payload.stderrString);
    if(message.payload.stdoutString == "yes\n"){
      started=true;
      console.log("Hyperion-WebOS is started!");
    } else {
      started=false;
      console.log("Hyperion-WebOS is not started!");
    }
    //Maybe some script errorhandling in future
    scriptrun = true;
  });

  while (!scriptrun) {
    setcounter++;
    console.log("isStarted.sh not fully run yet. Waiting two secounds. Trynumber: " + setcounter);
    await sleep(2000);
  }
}

async function isStarted(message){
  await isHyperionStarted();
  message.respond({
    returnValue: true,
    isStarted: started
});
}

async function getCapturePermsStatus(){
  hasCapturePerms = false;
  //File /usr/share/luna-service2/roles.d/org.webosbrew.piccap.service.role.json existing?
  console.log("Try to get permission status. Checking file existence of /usr/share/luna-service2/roles.d/org.webosbrew.piccap.service.role.json ..");

  try{
    await accessFile("/usr/share/luna-service2/roles.d/org.webosbrew.piccap.service.role.json", fsSync.constants.F_OK);
  } catch(e) {
    hasCapturePerms = false;
    console.log("/usr/share/luna-service2/roles.d/org.webosbrew.piccap.service.role.json not found. Assuming permissions not enforced. Error: " + e);
    return;
  }
  hasCapturePerms = true;
}

async function areCapturePermsNeeded(){
  capturePermsNeeded = false;
  var found1 = true;
  var found2 = true;
  console.log("Trying to get info about library. Checking file existence of /usr/lib/libvtcapture.so.1 or /usr/lib/libvtcapture.so.1.0.0 ..");

  try{
    await accessFile("/usr/lib/libvtcapture.so.1", fsSync.constants.F_OK);
  } catch(e) {
    found1 = false;
    console.log("/usr/lib/libvtcapture.so.1 not found. Error: " + e);
  }

  try{
    await accessFile("/usr/lib/libvtcapture.so.1.0.0", fsSync.constants.F_OK);
  } catch(e) {
    found2 = false;
    console.log("/usr/lib/libvtcapture.so.1.0.0 not found. Error: " + e);
  }

  if (found1 || found2 ){
    capturePermsNeeded = true;
    console.log("Library libvtcapture was found. Capture permissions will be needed!");
    return;
  }
  console.log("Library libvtcapture was not found. Capture permissions will not be needed!");
}

async function doPermScript(){
  setcounter = 0;
  scriptrun = false;
  console.log("Executing setlibvtcaptureperms.sh using HBChannel..");
  service.call("luna://org.webosbrew.hbchannel.service/exec", {
    "command":"/bin/bash /media/developer/apps/usr/palm/services/org.webosbrew.piccap.service/setlibvtcaptureperms.sh"
  }, function(message) {
    console.log("HBChannel exec returns: " + message.payload.stdoutString);
    console.log("HBChannel exec stderr returns: " + message.payload.stderrString);
    //Maybe some script errorhandling in future
    scriptrun = true;
  });

  while (!scriptrun) {
    setcounter++;
    console.log("Script not fully run yet. Waiting two secounds. Trynumber: " + setcounter);
    await sleep(2000);
  }
}

async function setCapturePerms(message) {
  console.log("Trying to set libvtcapture permissions..")

  await areCapturePermsNeeded();
  if (!capturePermsNeeded){
    message.respond({
      returnValue: true,
      hasPerms: hasCapturePerms,
      needed: capturePermsNeeded,
      data: "Perms: not needed"
    });
    return;
  }

  //Create files
  await doPermScript();

  await getCapturePermsStatus();

  if (hasCapturePerms) {
    message.respond({
      returnValue: true,
      hasPerms: hasCapturePerms,
      needed: capturePermsNeeded,
      data: "Perms: enforced"
    });
  } else {
    message.respond({
      returnValue: true,
      hasPerms: hasCapturePerms,
      needed: capturePermsNeeded,
      data: "Perms: failed"
    });
  }

}

service.register("isRoot", function(message) {
  console.log("isRoot called!");
  getRootStatus(message);
});

service.register("resetSettings", function(message) {
  console.log("Reset settings called!");
  resetSettings(message);
});

service.register("saveSettings", function(message) {
  console.log("Save settings called!");
  saveSettings(message);
});

service.register("setSettings", function(message) {
  console.log("Set settings called!");
  setSettings(message);
});

service.register("getSettings", function(message) {
  console.log("Get settings called!");
  if (!setloaded) {
    message.respond({
      returnValue: true,
      loaded: false,
      data: "Not loaded yet!"
    });
    console.log("Responding with not loaded yet!");
  }else{
    message.respond({
        returnValue: true,
        ip: ip,
        port: port,
        startdelay: startdelay,
        width: width,
        height: height,
        fps: fps,
        lib: lib,
        videocapture: videocapture,
        graphiccapture: graphiccapture,
        autostart: autostart,
        loaded: true,
        data: "Settings send!"
    });
    console.log("Responding with following settings: IP: " + ip + " Port: " + port + " Startdelay: " + startdelay + " Width: " + width + " Height: " + height + " FPS: " + fps + " Lib: " + lib + " Videocapture: " + videocapture + " Graphiccapture: " + graphiccapture + " Autostart: " + autostart);
  }
});

service.register("isStarted", function(message) {
  console.log("isStarted called!");
  isStarted(message);
});

async function dummystart(message){
  await startService();
  isStarted(message);
}

service.register("start", function(message) {
  console.log("Service start called!");
  dummystart(message);
});

async function dummystop(message){
  await stopService();
  isStarted(message);
}

service.register("stop", function(message) {
  console.log("Service stop called!");
  dummystop(message);
});

service.register("setCapturePerms", function(message) {
  console.log("Service setCapturePerms called! Actual status: " + started);
  setCapturePerms(message);
});

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
