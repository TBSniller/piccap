#!/usr/bin/env node
require('core-js/stable');
require('regenerator-runtime');

const pkgInfo = require('./package.json');
const fs = require('fs');
const path = require('path');
const { Promise } = require('bluebird');
const { asyncCall, tryRespond } = require('./service-utils');
const { spawn, exec } = require('child_process');

const readFile = Promise.promisify(fs.readFile);
const writeFile = Promise.promisify(fs.writeFile);
const unlinkFile = Promise.promisify(fs.unlink);
const accessFile = Promise.promisify(fs.access);
const execAsync = Promise.promisify(exec);

const configFilePath = path.join(__dirname, 'config.json');
const binaryPath = path.join(__dirname, 'hyperion-webos');

process.env.LD_LIBRARY_PATH = `${__dirname}:${process.env.LD_LIBRARY_PATH}`;
process.env.SEGFAULT_SIGNALS = '';

console.info(process.argv);
console.info(process.env);

let childProcess = null;
let restart = false;

function isRoot() {
  return process.getuid() == 0;
}

async function readConfig() {
  // Default values...
  const config = {
    ip: '192.168.178.2',
    port: 19400,
    width: null,
    height: null,
    fps: null,
    backend: null,

    captureVideo: true,
    captureUI: true,

    autostart: false,
  };

  try {
    Object.assign(config, JSON.parse(await readFile(configFilePath)));
  } catch (err) {
    console.warn(err);
  }

  return config;
}

async function saveConfig(config) {
  await writeFile(configFilePath, JSON.stringify(config));
}

const Service = require('webos-service');
const service = new Service(pkgInfo.name);

function spawnHyperion(activity, config) {
  const options = ['--address', config.ip, '--port', config.port];

  if (!config.captureUI) options.push('--no-gui');
  if (!config.captureVideo) options.push('--no-video');

  if (config.fps) {
    options.push('--fps', String(config.fps));
  }

  if (config.width || config.height) {
    options.push('--width', String(config.width));
    options.push('--height', String(config.height));
  }

  if (config.backend) {
    options.push('--backend', config.backend);
  }

  console.info('Spawning hyperion-webos', options);

  return new Promise((resolve, reject) => {
    // Early crash detection
    let fulfilled = false;
    let log = '';

    setTimeout(() => {
      if (!fulfilled) {
        fulfilled = true;
        resolve(log);
      }
    }, 1000);

    childProcess = spawn(binaryPath, options, { stdio: ['pipe', 'pipe', 'pipe'] });
    childProcess.stdout.on('data', (data) => {
      if (!fulfilled) {
        log += data;
      }
    });
    childProcess.stderr.on('data', (data) => {
      if (!fulfilled) {
        log += data;
      }
    });
    childProcess.on('close', (code, signal) => {
      if (!fulfilled) {
        fulfilled = true;
        reject(new Error('Process failed early: ' + log));
      }

      if (!restart) {
        if (activity) {
          service.activityManager.complete(activity, () => {
            console.info('Activity completed');
          });
          childProcess = null;
        }
      }

      console.info('Child process stopped!', code, signal);
      setTimeout(() => {
        if (restart) {
          spawnHyperion(activity, config);
        }
      }, 1000);
    });
  });
}

service.register(
  'isRoot',
  tryRespond(async (message) => {
    console.log('isRoot called!');
    let elevateResult = {};
    const rootStatus = isRoot();
    if (!rootStatus) {
      try {
        elevateResult = await asyncCall(service, 'luna://org.webosbrew.hbchannel.service/exec', {
          command: `./elevate-service ${pkgInfo.name}`,
        });
        if (elevateResult.returnValue === true) {
          service.activityManager.idleTimeout = 0.1;
        }
      } catch (err) {
        elevateResult = err.message;
      }
    }

    return {
      returnValue: true,
      rootStatus,
      permStatus: 'Not needed: ' + JSON.stringify(elevateResult),
      data: 'Got root status!',
    };
  }),
);

service.register(
  'resetSettings',
  tryRespond(async (message) => {
    console.log('Reset settings called!');
    await saveConfig({});
    return await readConfig();
  }),
);

service.register('saveSettings', function (message) {
  console.log('Save settings called!');
  // saveSettings(message);
  // ??
});

service.register(
  'setSettings',
  tryRespond(async (message) => {
    console.log('Set settings called!');
    const config = await readConfig();
    Object.assign(config, message.payload);
    await saveConfig(config);
    if (isRoot()) {
      if (config.autostart) {
        await execAsync(
          `mkdir -p /var/lib/webosbrew/init.d && ln -svf ${__dirname}/autostart.sh /var/lib/webosbrew/init.d/piccapautostart`,
        );
      } else {
        await execAsync(`rm -f /var/lib/webosbrew/init.d/piccapautostart`);
      }
    }
    return config;
  }),
);

service.register(
  'getSettings',
  tryRespond(async (message) => {
    return {
      loaded: true,
      ...(await readConfig()),
    };
  }),
);

service.register(
  'isStarted',
  tryRespond(async (message) => {
    console.log('isStarted called!');
    return {
      isStarted: childProcess && childProcess.exitCode === null ? true : false,
    };
  }),
);

service.register(
  'start',
  tryRespond(async (message) => {
    console.log('Service start called!');
    if (childProcess) {
      return { status: 'Already running!' };
    }

    const config = await readConfig();

    const activity = await new Promise((resolve, reject) => {
      service.activityManager.create('hyperion-webos-background', resolve);
    });

    const result = await spawnHyperion(activity, config);
    restart = true;

    return { returnValue: true, result };
  }),
);

service.register(
  'stop',
  tryRespond(async (message) => {
    console.log('Service stop called!');
    if (!childProcess) {
      return { status: 'Already stopped' };
    }
    restart = false;
    childProcess.kill();
  }),
);

// TODO
service.register('setCapturePerms', function (message) {
  console.log('Service setCapturePerms called! Actual status: ' + started);
  // setCapturePerms(message);
});
