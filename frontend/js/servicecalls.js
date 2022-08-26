require('core-js/stable');
require('regenerator-runtime');
const { Promise } = require('bluebird');

const availableQuirks = {
  // DILE_VT
  QUIRK_DILE_VT_CREATE_EX: '0x1',
  QUIRK_DILE_VT_NO_FREEZE_CAPTURE: '0x2',
  QUIRK_DILE_VT_DUMP_LOCATION_2: '0x4',
  // vtCapture
  QUIRK_VTCAPTURE_FORCE_CAPTURE: '0x100',
};

// let loggingStarted = false;
let statusRefreshStarted = false;

function wait(t) {
  return new Promise((resolve) => {
    setTimeout(resolve, t);
  });
}

function asyncCall(uri, args) {
  return new Promise((resolve, reject) => {
    const service = uri.split('/', 3).join('/');
    const method = uri.split('/').slice(3).join('/');
    /* eslint-disable no-undef */
    webOS.service.request(service, {
      method,
      parameters: args,
      onComplete: resolve,
      onFailure: reject,
    });
    /* eslint-enable no-undef */
  });
}

async function killHyperion() {
  document.getElementById('txtInfoState').innerHTML = 'Killing service..';
  const res = await asyncCall('luna://org.webosbrew.hbchannel.service/exec', { command: 'kill -9 $(pidof hyperion-webos)' });
  console.log(`HBChannel exec returned. stdout: ${res.stdoutString} stderr: ${res.stderrString}`);
}

async function makeServiceRoot() {
  console.log('Rooting..');
  document.getElementById('txtInfoState').innerHTML = 'Rooting app and service..';
  const res = await asyncCall('luna://org.webosbrew.hbchannel.service/exec', { command: '/media/developer/apps/usr/palm/services/org.webosbrew.hbchannel.service/elevate-service org.webosbrew.piccap; /media/developer/apps/usr/palm/services/org.webosbrew.hbchannel.service/elevate-service org.webosbrew.piccap.service' });
  console.log(`HBChannel exec returned. stdout: ${res.stdoutString} stderr: ${res.stderrString}`);

  console.log('Killing service process..');
  document.getElementById('txtInfoState').innerHTML = 'Killing service..';
  await killHyperion();

  document.getElementById('txtInfoState').innerHTML = 'Rooting finished';
}

async function checkRoot() {
  let wasRoot = true;
  const isroot = false;
  let rootinprog = false;

  document.getElementById('txtInfoState').innerHTML = 'Checking root status';
  document.getElementById('txtServiceStatus').innerHTML = 'Processing root check';

  for (let i = 0; i < 15; i += 1) {
    /* eslint-disable no-await-in-loop */
    const res = await asyncCall('luna://org.webosbrew.piccap.service/status', {});
    console.info(res);

    if (res.elevated) {
      if (!wasRoot) {
        document.getElementById('txtInfoState').innerHTML = 'Success! Running as root.';
        await wait(3000);
        return;
      }
      document.getElementById('txtInfoState').innerHTML = 'Running as root';
      break;
    }

    if (!isroot) {
      wasRoot = false;
      document.getElementById('txtInfoState').innerHTML = 'Service elevation in progress..';
      if (!rootinprog) {
        rootinprog = true;
        console.log('Sending elevation command to HBChannel.');
        makeServiceRoot();
      }
      await wait(2000);
    }
    document.getElementById('txtInfoState').innerHTML = 'Not running as root! Please try to reboot your TV (PicCap -> Settings -> Reboot).';
    document.getElementById('txtInfoState').innerHTML = 'Finished processing root status';
    /* eslint-enable no-await-in-loop */
  }
}

async function getStatus() {
  document.getElementById('txtInfoState').innerHTML = 'Getting status info..';
  const res = await asyncCall('luna://org.webosbrew.piccap.service/status', {});

  document.getElementById('txtServiceVersion').innerHTML = res.version;
  document.getElementById('txtServiceStatus').innerHTML = res.isRunning ? 'Capturing' : 'Not capturing';

  document.getElementById('txtInfoReceiver').innerHTML = res.connected ? 'Connected' : 'Disconnected';
  document.getElementById('txtInfoVideo').innerHTML = res.videoRunning ? `Capturing with ${res.videoBackend}` : 'Not capturing';
  document.getElementById('txtInfoUI').innerHTML = res.uiRunning ? `Capturing with ${res.uiBackend}` : 'Not capturing';
  document.getElementById('txtInfoFPS').innerHTML = res.framerate;

  document.getElementById('txtInfoState').innerHTML = 'Status info refreshed';
}

async function getSettings() {
  document.getElementById('txtInfoState').innerHTML = 'Loading settings..';
  const config = await asyncCall('luna://org.webosbrew.piccap.service/getSettings', {});
  console.info(config);

  document.getElementById('selectSettingsVideoBackend').value = config.novideo === true ? 'disabled' : config.backend || 'auto';
  document.getElementById('selectSettingsGraphicalBackend').value = config.nogui === true ? 'disabled' : config.uibackend || 'auto';

  document.getElementById('txtInputSettingsAddress').value = config.address || '127.0.0.1';
  document.getElementById('txtInputSettingsPort').value = config.port;
  document.getElementById('txtInputSettingsPriority').value = config.priority;

  document.getElementById('txtInputSettingsFPS').value = config.fps;

  // Process Height/Width for easier selection
  switch (config.width * config.height) {
    case 57600:
      document.getElementById('selectSettingsResolution').value = '320x180';
      break;
    case 36864:
      document.getElementById('selectSettingsResolution').value = '256x144';
      break;
    case 20736:
      document.getElementById('selectSettingsResolution').value = '192x108';
      break;
    case 9984:
      document.getElementById('selectSettingsResolution').value = '128x78';
      break;
    default:
      document.getElementById('selectSettingsResolution').value = 'manual';
      document.getElementById('txtInputSettingsWidth').value = config.width;
      document.getElementById('txtInputSettingsHeight').value = config.height;
      break;
  }

  Object.keys(availableQuirks).forEach((quirk) => {
    console.log(`Processing: ${quirk}`);
    const quirkval = availableQuirks[quirk];
    /* eslint-disable eqeqeq */
    if ((config.quirks & quirkval) == quirkval) {
      console.log(`Quirk ${quirk} enabled!`);
      document.getElementById(`checkSettings${quirk}`).checked = true;
    }
    /* eslint-enable eqeqeq */
  });

  document.getElementById('checkSettingsVSync').checked = config.vsync;
  document.getElementById('checkSettingsAutostart').checked = config.autostart;

  console.info('Done!');
  document.getElementById('txtInfoState').innerHTML = 'Settings loaded';
  getStatus();
}

async function statusloop(state) {
  if (state === 'stop') {
    statusRefreshStarted = false;
    document.getElementById('txtInfoState').innerHTML = 'Status refreshing stopped';
    return;
  }

  console.log('Starting loop to get status from background service.');
  statusRefreshStarted = true;
  while (statusRefreshStarted) {
    await wait(3000);
    await getStatus();
  }
}

window.restartHyperion = async () => {
  document.getElementById('txtInfoState').innerHTML = 'Restarting hyperion..';
  await killHyperion();
  document.getElementById('txtInfoState').innerHTML = 'Call status to start it up..';
  await wait(3000);
  getStatus();
};

window.serviceResetSettings = async () => {
  document.getElementById('txtInfoState').innerHTML = 'Loading default settings..';
  const config = {
    backend: 'auto',
    uibackend: 'auto',

    novideo: false,
    nogui: false,

    address: '',
    port: 19400,
    priority: 150,

    fps: 0,

    width: 320,
    height: 180,
    quirks: 0,

    vsync: true,
    autostart: false,
  };

  console.info(config);

  document.getElementById('txtInfoState').innerHTML = 'Sending default settings..';
  await asyncCall('luna://org.webosbrew.piccap.service/setSettings', config);
  await getSettings();
  await getStatus();
  document.getElementById('txtInfoState').innerHTML = 'Settings send and reloaded';
};

window.serviceSaveSettings = async () => {
  document.getElementById('txtInfoState').innerHTML = 'Collecting settings..';

  let quirkcalc = 0;
  Object.keys(availableQuirks).forEach((quirk) => {
    console.log(`Processing quirk: ${quirk}`);
    const quirkval = availableQuirks[quirk];
    console.log(`Quirk val: ${quirkval}`);
    if (document.getElementById(`checkSettings${quirk}`).checked === true) {
      quirkcalc |= quirkval;
      console.log(`Quirkcalc: ${quirkcalc}`);
    }
  });

  let width;
  let height;
  switch (document.getElementById('selectSettingsResolution').value) {
    case '320x180':
      width = 320;
      height = 180;
      break;
    case '256x144':
      width = 256;
      height = 144;
      break;
    case '192x108':
      width = 192;
      height = 108;
      break;
    case '128x78':
      width = 128;
      height = 78;
      break;
    case 'manual':
      width = parseInt(document.getElementById('txtInputSettingsWidth').value, 10);
      height = parseInt(document.getElementById('txtInputSettingsHeight').value, 10);
      break;
    default:
      width = 320;
      height = 180;
      break;
  }

  const config = {
    backend: document.getElementById('selectSettingsVideoBackend').value === 'disabled' ? 'auto' : document.getElementById('selectSettingsVideoBackend').value,
    uibackend: document.getElementById('selectSettingsGraphicalBackend').value === 'disabled' ? 'auto' : document.getElementById('selectSettingsGraphicalBackend').value,

    novideo: document.getElementById('selectSettingsVideoBackend').value === 'disabled',
    nogui: document.getElementById('selectSettingsGraphicalBackend').value === 'disabled',

    address: document.getElementById('txtInputSettingsAddress').value || undefined,
    port: parseInt(document.getElementById('txtInputSettingsPort').value, 10) || undefined,
    priority: parseInt(document.getElementById('txtInputSettingsPriority').value, 10) || undefined,

    fps: parseInt(document.getElementById('txtInputSettingsFPS').value, 10) || 0,

    width: width || undefined,
    height: height || undefined,
    quirks: quirkcalc,

    vsync: document.getElementById('checkSettingsVSync').checked,
    autostart: document.getElementById('checkSettingsAutostart').checked,
  };

  console.info(config);

  document.getElementById('txtInfoState').innerHTML = 'Sending settings..';
  await asyncCall('luna://org.webosbrew.piccap.service/setSettings', config);
  await getSettings();
  await getStatus();
  document.getElementById('txtInfoState').innerHTML = 'Settings send and reloaded';
};

window.reloadHyperionLog = async () => {
  const textareaHyperionLog = document.getElementById('textareaHyperionLog');

  console.log('Calling HBCHannel to get latest 200 hyperion-webos log lines.');
  const res = await asyncCall('luna://org.webosbrew.hbchannel.service/exec', { command: 'grep hyperion-webos /var/log/messages | tail -n200' });
  console.log(`HBChannel exec returned. stderr: ${res.stderrString}`);
  textareaHyperionLog.value += `${res.stdoutString}\r\n`;
};

// Using this function to setup logging for now.
// Future start/stop of currently not implemented hyperion-webos log method.
window.startStopLogging = async () => {
  console.log('Setup logging using HBChannel');
  document.getElementById('txtInfoState').innerHTML = 'Calling HBChannel for log setup';
  const res = await asyncCall('luna://org.webosbrew.hbchannel.service/exec', { command: '/media/developer/apps/usr/palm/services/org.webosbrew.piccap.service/setuplegacylogging.sh' });
  console.log(`HBChannel exec returned. stdout: ${res.stdoutString} stderr: ${res.stderrString}`);

/*
  // Future Stuff
  const btnLogStartStop = document.getElementById('btnLogStartStop');
  if (!loggingStarted) {
    loggingStarted = true;
    btnLogStartStop.innerHTML = 'Stop logging';
  } else {
    loggingStarted = false;
    btnLogStartStop.innerHTML = 'Start logging';
  } */
};

window.serviceStart = async () => {
  try {
    document.getElementById('txtServiceStatus').innerHTML = 'Starting service...';
    document.getElementById('txtInfoState').innerHTML = 'Sending start command';
    await asyncCall('luna://org.webosbrew.piccap.service/start');
    await getStatus();
  } catch (err) {
    document.getElementById('txtServiceStatus').innerHTML = `Failed: ${JSON.stringify(err)}`;
  }
  document.getElementById('txtInfoState').innerHTML = 'Start command send';
};

window.serviceStop = async () => {
  try {
    document.getElementById('txtServiceStatus').innerHTML = 'Stopping service...';
    document.getElementById('txtInfoState').innerHTML = 'Sending stop command';
    await asyncCall('luna://org.webosbrew.piccap.service/stop');
    await getStatus();
  } catch (err) {
    document.getElementById('txtServiceStatus').innerHTML = `Failed: ${JSON.stringify(err)}`;
  }
  document.getElementById('txtInfoState').innerHTML = 'Stop command send';
};

window.serviceReload = async () => {
  await getSettings();
};

window.tvReboot = async () => {
  console.log('Trying to reboot TV using HBChannel..');
  document.getElementById('txtInfoState').innerHTML = 'Rebooting TV..';
  const res = await asyncCall('luna://org.webosbrew.hbchannel.service/reboot', {});
  console.log(res);
};

async function startup() {
  await wait(2000);

  // Overwrite console.log
  const consoleLog = window.console.log;
  /* eslint-disable func-names */
  window.console.log = function (...args) {
    consoleLog(...args);
    const textareaConsoleLog = document.getElementById('textareaConsoleLog');
    if (!textareaConsoleLog) return;
    args.forEach((arg) => { textareaConsoleLog.value += `${JSON.stringify(arg)}\n`; });
  };
  /* eslint-enable func-names */

  await checkRoot();
  await getSettings();
  await getStatus();
  statusloop();
}
startup();
