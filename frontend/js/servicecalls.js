require('core-js/stable');

const availableQuirks = {
  // DILE_VT
  QUIRK_DILE_VT_CREATE_EX: '0x1',
  QUIRK_DILE_VT_NO_FREEZE_CAPTURE: '0x2',
  QUIRK_DILE_VT_DUMP_LOCATION_2: '0x4',
  // vtCapture
  QUIRK_VTCAPTURE_FORCE_CAPTURE: '0x100',
};

let isRoot = false;
let rootingInProgress = false;

function logIt(message) {
  const textareaConsoleLog = document.getElementById('textareaConsoleLog');
  console.log(message);
  textareaConsoleLog.value += `${message}\n`;
}

function onHBExec(result) {
  if (result.returnValue === true) {
    logIt(`HBChannel exec returned. stdout: ${result.stdoutString} stderr: ${result.stderrString}`);
  } else {
    logIt(`HBChannel exec failed! Code: ${result.errorCode}`);
  }
}

function killHyperion() {
  document.getElementById('txtInfoState').innerHTML = 'Killing service..';
  logIt('Calling HBChannel exec to kill hyperion-webos');
  /* eslint-disable no-undef */
  webOS.service.request(
    'luna://org.webosbrew.hbchannel.service',
    {
      method: 'exec',
      parameters: {
        command: 'kill -9 $(pidof hyperion-webos)',
      },
      onSuccess: onHBExec,
      onFailure: onHBExec,
    },
  );
  /* eslint-enable no-undef */
}

function makeServiceRoot() {
  logIt('Rooting..');
  document.getElementById('txtInfoState').innerHTML = 'Rooting app and service..';
  logIt('Calling HBChannel exec to elevate app and service');
  /* eslint-disable no-undef */
  webOS.service.request(
    'luna://org.webosbrew.hbchannel.service',
    {
      method: 'exec',
      parameters: {
        command: '/media/developer/apps/usr/palm/services/org.webosbrew.hbchannel.service/elevate-service org.webosbrew.piccap; /media/developer/apps/usr/palm/services/org.webosbrew.hbchannel.service/elevate-service org.webosbrew.piccap.service',
      },
      onSuccess(result) {
        onHBExec(result);

        logIt('Elevation completed - killing service process..');
        document.getElementById('txtInfoState').innerHTML = 'Killing service..';
        killHyperion();
      },
      onFailure: onHBExec,
    },
  );
  /* eslint-enable no-undef */

  document.getElementById('txtInfoState').innerHTML = 'Finished making root processing';
}

let checkRootStatusIntervalID = null;
function onCheckRootStatus(result) {
  if (result.returnValue === true) {
    if (result.elevated) {
      logIt('PicCap-Service returned rooted!');
      document.getElementById('txtInfoState').innerHTML = 'Running as root';
      isRoot = true;
      clearInterval(checkRootStatusIntervalID);
      rootingInProgress = false;
    } else {
      if (rootingInProgress === false) {
        logIt('Rooting not in progress yet.');
        makeServiceRoot();
        rootingInProgress = true;
      }
      logIt('PicCap-Service returned not rooted yet! Will check again soon.');
      document.getElementById('txtInfoState').innerHTML = 'Not running as root. Service elevation in progress..';
    }
  } else {
    logIt(`Getting root-status from PicCap-Service failed! Will try again. Code: ${result.errorCode}`);
    document.getElementById('txtInfoState').innerHTML = 'PicCap-Service status failed!';
  }
}

function checkRoot() {
  document.getElementById('txtServiceStatus').innerHTML = 'Processing root check';
  logIt('Starting loop for PicCap-Service to get root-status');

  let firstInterval = true;
  checkRootStatusIntervalID = window.setInterval(() => {
    logIt('Calling PicCap-Service to get root-status');
    document.getElementById('txtInfoState').innerHTML = 'Checking root status';
    /* eslint-disable no-undef */
    webOS.service.request(
      'luna://org.webosbrew.piccap.service',
      {
        method: 'status',
        parameters: {},
        onSuccess: onCheckRootStatus,
        onFailure: onCheckRootStatus,
      },
    );
    /* eslint-enable no-undef */

    if (rootingInProgress === false && isRoot === false && firstInterval === false) {
      logIt('Not rooted and rooting not in progress yet.');
      makeServiceRoot();
      rootingInProgress = true;
    }
    firstInterval = false;
  }, 3000);
}

function getStatus() {
  document.getElementById('txtInfoState').innerHTML = 'Getting status info..';
  /* eslint-disable no-undef */
  webOS.service.request(
    'luna://org.webosbrew.piccap.service',
    {
      method: 'status',
      parameters: {},
      onSuccess(result) {
        if (result.returnValue === true) {
          document.getElementById('txtServiceVersion').innerHTML = result.version;
          document.getElementById('txtServiceStatus').innerHTML = result.isRunning ? 'Capturing' : 'Not capturing';

          document.getElementById('txtInfoReceiver').innerHTML = result.connected ? 'Connected' : 'Disconnected';
          document.getElementById('txtInfoVideo').innerHTML = result.videoRunning ? `Capturing with ${result.videoBackend}` : 'Not capturing';
          document.getElementById('txtInfoUI').innerHTML = result.uiRunning ? `Capturing with ${result.uiBackend}` : 'Not capturing';
          document.getElementById('txtInfoFPS').innerHTML = result.framerate.toFixed(2); /* Round to 2 decimal points */

          document.getElementById('txtInfoState').innerHTML = 'Status info refreshed';
        } else {
          logIt('Getting status info from PicCap-Service failed! Return value false!');
          document.getElementById('txtInfoState').innerHTML = 'Getting status info failed!';
        }
      },
      onFailure(result) {
        logIt(`Getting status info from PicCap-Service failed! Code: ${result.errorCode}`);
        document.getElementById('txtInfoState').innerHTML = 'Getting status info failed!';
      },
    },
  );
  /* eslint-enable no-undef */
}

function getSettings() {
  document.getElementById('txtInfoState').innerHTML = 'Loading settings..';
  /* eslint-disable no-undef */
  webOS.service.request(
    'luna://org.webosbrew.piccap.service',
    {
      method: 'getSettings',
      parameters: {},
      onSuccess(result) {
        if (result.returnValue === true) {
          document.getElementById('selectSettingsVideoBackend').value = result.novideo === true ? 'disabled' : result.backend || 'auto';
          document.getElementById('selectSettingsGraphicalBackend').value = result.nogui === true ? 'disabled' : result.uibackend || 'auto';

          document.getElementById('checkSettingsLocalSocket').checked = result['unix-socket'];
          socketCheckChanged(document.getElementById('checkSettingsLocalSocket'));

          if (result.address.includes('/')) {
            switch (result.address) {
              case '/tmp/hyperhdr-domain':
                document.getElementById('selectSettingsSocket').value = 'hyperhdr';
                break;
              default:
                document.getElementById('selectSettingsSocket').value = 'manual';
                document.getElementById('txtInputSettingsAddress').value = result.address;
            }
            document.getElementById('txtInputSettingsAddress').value = '127.0.0.1';
            socketSelectChanged(document.getElementById('selectSettingsSocket'));
          } else {
            document.getElementById('txtInputSettingsAddress').value = result.address || '127.0.0.1';
          }

          document.getElementById('txtInputSettingsPort').value = result.port;
          document.getElementById('txtInputSettingsPriority').value = result.priority;

          document.getElementById('txtInputSettingsFPS').value = result.fps;

          // Process Height/Width for easier selection
          switch (result.width * result.height) {
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
              document.getElementById('txtInputSettingsWidth').value = result.width;
              document.getElementById('txtInputSettingsHeight').value = result.height;
              break;
          }

          Object.keys(availableQuirks).forEach((quirk) => {
            logIt(`Processing: ${quirk}`);
            const quirkval = availableQuirks[quirk];
            /* eslint-disable eqeqeq */
            if ((result.quirks & quirkval) == quirkval) {
              logIt(`Quirk ${quirk} enabled!`);
              document.getElementById(`checkSettings${quirk}`).checked = true;
            }
            /* eslint-enable eqeqeq */
          });

          document.getElementById('checkSettingsVSync').checked = result.vsync;
          document.getElementById('checkSettingsAutostart').checked = result.autostart;
          document.getElementById('checkSettingsNoHDR').checked = result.nohdr;
          document.getElementById('checkSettingsNoPowerstate').checked = result.nopowerstate;

          logIt('Loading settings done!');
          document.getElementById('txtInfoState').innerHTML = 'Settings loaded';
        } else {
          logIt('Getting settings from PicCap-Service failed! Return value false!');
          document.getElementById('txtInfoState').innerHTML = 'Getting settings failed!';
        }
      },
      onFailure(result) {
        logIt(`Getting settings from PicCap-Service failed! Code: ${result.errorCode}`);
        document.getElementById('txtInfoState').innerHTML = 'Getting settings failed!';
      },
    },
  );
  /* eslint-enable no-undef */
}

window.restartHyperion = () => {
  document.getElementById('txtInfoState').innerHTML = 'Killing hyperion.. Will be started again through status loop';
  killHyperion();
};

function saveSettings(config) {
  /* eslint-disable no-undef */
  webOS.service.request(
    'luna://org.webosbrew.piccap.service',
    {
      method: 'setSettings',
      parameters: config,
      onSuccess(result) {
        if (result.returnValue === true) {
          logIt('Saving settings success!');
          document.getElementById('txtInfoState').innerHTML = 'Save settings success!';
          getSettings();
        } else {
          logIt('Save settings for PicCap-Service failed! Return value false!');
          document.getElementById('txtInfoState').innerHTML = 'Save settings failed!';
        }
      },
      onFailure(result) {
        logIt(`Save settings for PicCap-Service failed! Code: ${result.errorCode}`);
        document.getElementById('txtInfoState').innerHTML = 'Sace settings failed!';
      },
    },
  );
  /* eslint-enable no-undef */
}

window.serviceResetSettings = () => {
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
  logIt(config);

  document.getElementById('txtInfoState').innerHTML = 'Sending default settings..';
  saveSettings(config);
};

window.serviceSaveSettings = () => {
  document.getElementById('txtInfoState').innerHTML = 'Collecting settings..';

  let quirkcalc = 0;
  Object.keys(availableQuirks).forEach((quirk) => {
    logIt(`Processing quirk: ${quirk}`);
    const quirkval = availableQuirks[quirk];
    logIt(`Quirk val: ${quirkval}`);
    if (document.getElementById(`checkSettings${quirk}`).checked === true) {
      quirkcalc |= quirkval;
      logIt(`Quirkcalc: ${quirkcalc}`);
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

  let address;
  if (document.getElementById('checkSettingsLocalSocket').checked === true) {
    switch (document.getElementById('selectSettingsSocket').value) {
      case 'hyperhdr':
        address = '/tmp/hyperhdr-domain';
        break;
      case 'manual':
        address = document.getElementById('txtInputSettingsSocketPath').value;
        break;
      default:
        address = undefined;
        logIt('Address wasnt found!');
        break;
    }
  } else {
    address = document.getElementById('txtInputSettingsAddress').value;
  }

  const config = {
    backend: document.getElementById('selectSettingsVideoBackend').value === 'disabled' ? 'auto' : document.getElementById('selectSettingsVideoBackend').value,
    uibackend: document.getElementById('selectSettingsGraphicalBackend').value === 'disabled' ? 'auto' : document.getElementById('selectSettingsGraphicalBackend').value,

    novideo: document.getElementById('selectSettingsVideoBackend').value === 'disabled',
    nogui: document.getElementById('selectSettingsGraphicalBackend').value === 'disabled',

    'unix-socket': document.getElementById('checkSettingsLocalSocket').checked,
    address,
    port: parseInt(document.getElementById('txtInputSettingsPort').value, 10) || undefined,
    priority: parseInt(document.getElementById('txtInputSettingsPriority').value, 10) || undefined,

    fps: parseInt(document.getElementById('txtInputSettingsFPS').value, 10) || 0,

    width: width || undefined,
    height: height || undefined,
    quirks: quirkcalc,

    vsync: document.getElementById('checkSettingsVSync').checked,
    autostart: document.getElementById('checkSettingsAutostart').checked,
    nohdr: document.getElementById('checkSettingsNoHDR').checked,
    nopowerstate: document.getElementById('checkSettingsNoPowerstate').checked,

  };

  logIt(`Config: ${JSON.stringify(config)}`);

  document.getElementById('txtInfoState').innerHTML = 'Sending settings..';
  saveSettings(config);
};

window.reloadHyperionLog = () => {
  logIt('Calling HBCHannel to get latest 200 hyperion-webos log lines.');
  /* eslint-disable no-undef */
  webOS.service.request(
    'luna://org.webosbrew.hbchannel.service',
    {
      method: 'exec',
      parameters: {
        command: 'grep hyperion-webos /var/log/messages | tail -n200',
      },
      onSuccess(result) {
        onHBExec(result);
        const textareaHyperionLog = document.getElementById('textareaHyperionLog');
        textareaHyperionLog.value += `${result.stdoutString}\r\n`;
      },
      onFailure: onHBExec,
    },
  );
  /* eslint-enable no-undef */
};

// Using this function to setup logging for now.
// Future start/stop of currently not implemented hyperion-webos log method.
window.startStopLogging = () => {
  logIt('Setup logging using HBChannel');
  document.getElementById('txtInfoState').innerHTML = 'Calling HBChannel for log setup';
  /* eslint-disable no-undef */
  webOS.service.request(
    'luna://org.webosbrew.hbchannel.service',
    {
      method: 'exec',
      parameters: {
        command: '/media/developer/apps/usr/palm/services/org.webosbrew.piccap.service/setuplegacylogging.sh',
      },
      onSuccess: onHBExec,
      onFailure: onHBExec,
    },
  );
  /* eslint-enable no-undef */
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

function onServiceCallback(result) {
  if (result.returnValue === true) {
    logIt('Servicecall returned successfully.');
    document.getElementById('txtInfoState').innerHTML = 'Servicecall success!';
  } else {
    logIt(`Servicecall failed! Code: ${result.errorCode}`);
    document.getElementById('txtInfoState').innerHTML = 'Servicecall failed!';
  }
}

window.serviceStart = () => {
  logIt('Start clicked');
  try {
    document.getElementById('txtServiceStatus').innerHTML = 'Starting service...';
    document.getElementById('txtInfoState').innerHTML = 'Sending start command';
    /* eslint-disable no-undef */
    webOS.service.request(
      'luna://org.webosbrew.piccap.service',
      {
        method: 'start',
        parameters: {},
        onSuccess: onServiceCallback,
        onFailure: onServiceCallback,
      },
    );
    /* eslint-enable no-undef */
  } catch (err) {
    document.getElementById('txtServiceStatus').innerHTML = `Failed: ${JSON.stringify(err)}`;
  }
  document.getElementById('txtInfoState').innerHTML = 'Start command send';
};

window.serviceStop = () => {
  logIt('Stop clicked');
  try {
    document.getElementById('txtServiceStatus').innerHTML = 'Stopping service...';
    document.getElementById('txtInfoState').innerHTML = 'Sending stop command';
    /* eslint-disable no-undef */
    webOS.service.request(
      'luna://org.webosbrew.piccap.service',
      {
        method: 'stop',
        parameters: {},
        onSuccess: onServiceCallback,
        onFailure: onServiceCallback,
      },
    );
    /* eslint-enable no-undef */
  } catch (err) {
    document.getElementById('txtServiceStatus').innerHTML = `Failed: ${JSON.stringify(err)}`;
  }
  document.getElementById('txtInfoState').innerHTML = 'Stop command send';
};

window.serviceReload = () => {
  logIt('Reload clicked');
  getSettings();
};

window.tvReboot = () => {
  logIt('Trying to reboot TV using HBChannel..');
  document.getElementById('txtInfoState').innerHTML = 'Rebooting TV..';
  /* eslint-disable no-undef */
  webOS.service.request(
    'luna://org.webosbrew.hbchannel.service',
    {
      method: 'reboot',
      parameters: {},
      onSuccess: onServiceCallback,
      onFailure: onServiceCallback,
    },
  );
  /* eslint-enable no-undef */
};

window.addEventListener('load', () => {
  logIt('Startup of PicCap...');
  checkRoot();

  logIt('Starting load settings loop...');
  const getStatusIntervalID = window.setInterval(() => {
    if (isRoot === true) {
      logIt('Loading settings, we are rooted.');
      getSettings();
      clearInterval(getStatusIntervalID);
    }
  }, 3000);

  logIt('Starting status loop...');
  setInterval(() => {
    getStatus();
  }, 4000);
});
