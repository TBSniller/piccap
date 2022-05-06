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
reboot()	              - Btn Reboot
resetconf()		          - Btn Reset configuration 
*/

require('core-js/stable');
require('regenerator-runtime');
const { Promise } = require('bluebird');

function wait(t) {
  return new Promise((resolve, reject) => {
    setTimeout(resolve, t);
  });
}

function asyncCall(uri, args) {
  return new Promise((resolve, reject) => {
    const service = uri.split('/', 3).join('/');
    const method = uri.split('/').slice(3).join('/')
    webOS.service.request(service, {
      method,
      parameters: args,
      onComplete: resolve,
      onFailure: reject,
    });
  });
}

async function startup() {
  await checkRoot();
  await getSettings();
  await getStatus();
}

startup();

async function checkRoot(){
  let wasRoot = true;
  let isroot = false;

  for (let i = 0 ; i < 15 ; i++) {
    const res = await asyncCall('luna://org.webosbrew.piccap.service/isRoot', {});
    console.info(res);

    if (res.rootStatus){
      if(!wasRoot){
        document.getElementById("permissionstatus").innerHTML = 'Evaluate success! Rooted.';
        await wait(3000);
        return;
      }
      document.getElementById("permissionstatus").innerHTML = 'Running as root';
      break;
    }

    if(!isroot){
      wasRoot = false;
      document.getElementById("permissionstatus").innerHTML = 'Service elevation in progress..';
      await wait(2000);
    }
    document.getElementById("permissionstatus").innerHTML = 'Not running as root';
  }

}

async function getSettings() {
  const config = await asyncCall('luna://org.webosbrew.piccap.service/getSettings', {});
  console.info(config);

/*
{
  "returnValue":true,
  "priority":150,
  "address":"127.0.0.1",
  "port":19400,
  "width":360,
  "height":180,
  "fps":30,
  "backend":"libdile_vt",
  "uibackend":"auto"
  "vsync":false,
  "novideo":false,
  "nogui":false,
  "autostart":true,
}
*/

  document.getElementById("address").value = config.address;
  document.getElementById("port").value = config.port;
  document.getElementById("priority").value = config.priority;
  document.getElementById("width").value = config.width;
  document.getElementById("height").value = config.height;
  document.getElementById("fps").value = config.fps;

  document.getElementById("backend").value = config.backend || 'auto';
  document.getElementById("uibackend").value = config.uibackend || 'auto';

  document.getElementById("vsync").checked = config.vsync;
  document.getElementById("novideo").checked = config.novideo;
  document.getElementById("nogui").checked = config.nogui;
  document.getElementById("autostart").checked = config.autostart;

  console.info('Done!');
  getStatus();
}

async function getStatus() {
/*
{
  "connected":false,
  "returnValue":true,
  "uiBackend":"libgm_backend.so",
  "uiRunning":false,
  "videoBackend":"libdile_vt_backend.so",
  "framerate":7.4861935874763,
  "isRunning":false,
  "videoRunning":false
}
*/
  const res = await asyncCall('luna://org.webosbrew.piccap.service/status', {});
  document.getElementById("servicestatus").innerHTML = res.isRunning ? 'Capture is running.' : 'Capture is stopped.';
}

window.getSettings = async () => {
  await getSettings();
}

window.reboot = async () => {
    console.log("Trying to reboot TV using HBChannel..");
    document.getElementById("servicestatus").innerHTML = "Rebooting TV..";
    const res = await asyncCall('luna://org.webosbrew.hbchannel.service/reboot', {});
}

window.resetconf = () => {
  asyncCall('luna://org.webosbrew.piccap.service/resetSettings', {}).then(getSettings);
}

window.save = async () => {
/*
{
  "returnValue":true,
  "priority":150,
  "address":"127.0.0.1",
  "port":19400,
  "width":360,
  "height":180,
  "fps":30,
  "backend":"libdile_vt",
  "uibackend":"auto"
  "vsync":false,
  "novideo":false,
  "nogui":false,
  "autostart":true,
}
*/
  const config = {
    address: document.getElementById("address").value || undefined,
    port: parseInt(document.getElementById("port").value) || undefined,
    priority: parseInt(document.getElementById("priority").value) || undefined,
    width: parseInt(document.getElementById("width").value) || undefined,
    height: parseInt(document.getElementById("height").value) || undefined,
    fps: parseInt(document.getElementById("fps").value) || 0,
    
    backend: document.getElementById("backend").value,
    uibackend: document.getElementById("uibackend").value,

    vsync: document.getElementById("vsync").checked,
    novideo: document.getElementById("novideo").checked,
    nogui: document.getElementById("nogui").checked,
    autostart: document.getElementById("autostart").checked,
  };

  if (config.backend === 'auto') config.backend = null;

  console.info(config);

  document.getElementById("servicestatus").innerHTML = "Saving..";
  const res = await asyncCall('luna://org.webosbrew.piccap.service/setSettings', config);
  await getSettings();
  await getStatus();
}

window.startservice = async () => {
  try {
    document.getElementById("servicestatus").innerHTML = "Starting...";
    await asyncCall('luna://org.webosbrew.piccap.service/start');
    await getStatus();
  } catch (err) {
    document.getElementById("servicestatus").innerHTML = "Failed: "+ JSON.stringify(err);
  }
}

window.stopservice = async () => {
  try {
    document.getElementById("servicestatus").innerHTML = "Stopping...";
    await asyncCall('luna://org.webosbrew.piccap.service/stop');
    await getStatus();
  } catch (err) {
    document.getElementById("servicestatus").innerHTML = "Failed: "+ JSON.stringify(err);
  }
}
