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
  let root = false;

  for (let i = 0 ; i < 5 ; i++) {
    const res = await asyncCall('luna://org.webosbrew.piccap.service/isRoot', {});
    console.info(res);
    if (res.rootStatus){
      document.getElementById("permissionstatus").innerHTML = res.rootStatus ? 'Running as root' : 'Trying to evaluate service..';
      break;
    }
    document.getElementById("permissionstatus").innerHTML = res.rootStatus ? 'Running as root' : 'Trying to evaluate service..';
    await wait(2000);
  }
  await getSettings();
  await getStatus();
}

startup();

async function getSettings() {
  const config = await asyncCall('luna://org.webosbrew.piccap.service/getSettings', {});
  console.info(config);

  Array.prototype.slice.call(document.querySelectorAll('input[name="radiolib"]')).forEach(el => {
    el.checked = (config.backend || 'auto') === el.value;
  });

  document.getElementById("ip").value = config.ip;
  document.getElementById("port").value = config.port;
  document.getElementById("width").value = config.width;
  document.getElementById("height").value = config.height;
  document.getElementById("fps").value = config.fps;

  document.getElementById("videocapture").checked = config.captureVideo;
  document.getElementById("graphiccapture").checked = config.captureUI;
  document.getElementById("autostart").checked = config.autostart;

  console.info('Done!');
  getStatus();
}

async function getStatus() {
  const res = await asyncCall('luna://org.webosbrew.piccap.service/isRunning', {});
  document.getElementById("servicestatus").innerHTML = res.isRunning ? 'Running' : 'Stopped';

  const res1 = await asyncCall('luna://org.webosbrew.piccap.service/isRoot', {});
  console.info(res1);
  document.getElementById("permissionstatus").innerHTML = res1.rootStatus ? 'Running as root' : 'Not running as root';
}

window.getSettings = async () => {
  await getSettings();
}

window.restart = async () => {
    console.log("Trying to terminate service..");
    document.getElementById("servicestatus").innerHTML = "Terminating service..";
    const res = await asyncCall('luna://org.webosbrew.piccap.service/restart', {});
    
}

window.resetconf = () => {
  asyncCall('luna://org.webosbrew.piccap.service/resetSettings', {}).then(getSettings);
}

window.save = async () => {
  const config = {
    ip: document.getElementById("ip").value || undefined,
    port: parseInt(document.getElementById("port").value) || undefined,
    width: parseInt(document.getElementById("width").value) || undefined,
    height: parseInt(document.getElementById("height").value) || undefined,
    fps: parseInt(document.getElementById("fps").value) || undefined,
    backend: document.querySelector('input[name=radiolib]:checked').value,
    captureVideo: document.getElementById("videocapture").checked,
    captureUI: document.getElementById("graphiccapture").checked,
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
