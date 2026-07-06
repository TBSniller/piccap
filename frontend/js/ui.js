import packageJSON from '../../package.json';

function logIt(message) {
  const textareaConsoleLog = document.getElementById('textareaConsoleLog');
  console.log(message);
  textareaConsoleLog.value += `${message}\n`;
}

/* eslint-disable func-names */
window.switchView = function (view) {
  const service = document.getElementById('service');
  const settings = document.getElementById('settings');
  const logs = document.getElementById('logs');
  const about = document.getElementById('about');

  const btnservice = document.getElementById('btnNavService');
  const btnsettings = document.getElementById('btnNavSettings');
  const btnlogs = document.getElementById('btnNavLogs');
  const btnabout = document.getElementById('btnNavAbout');

  const settingItemsAdv = document.getElementById('settingItemsAdv');
  const settingItemsNormal = document.getElementById('settingItemsNormal');
  const btnAdvanced = document.getElementById('btnSettingsAdvanced');
  switch (view) {
    case 'service':
      service.style.display = 'block';
      btnservice.style.background = 'white';
      btnservice.style.color = 'black';

      settings.style.display = 'none';
      btnsettings.style.background = null;
      btnsettings.style.color = null;

      logs.style.display = 'none';
      btnlogs.style.background = null;
      btnlogs.style.color = null;

      about.style.display = 'none';
      btnabout.style.background = null;
      btnabout.style.color = null;
      break;
    case 'settings':
      service.style.display = 'none';
      btnservice.style.background = null;
      btnservice.style.color = null;

      settings.style.display = 'block';
      btnsettings.style.background = 'white';
      btnsettings.style.color = 'black';

      logs.style.display = 'none';
      btnlogs.style.background = null;
      btnlogs.style.color = null;

      about.style.display = 'none';
      btnabout.style.background = null;
      btnabout.style.color = null;

      // Open non advanced page
      btnAdvanced.style.background = null;
      btnAdvanced.style.color = null;
      settingItemsNormal.style.display = 'block';
      settingItemsAdv.style.display = 'none';
      break;
    case 'logs':
      service.style.display = 'none';
      btnservice.style.background = null;
      btnservice.style.color = null;

      settings.style.display = 'none';
      btnsettings.style.background = null;
      btnsettings.style.color = null;

      logs.style.display = 'block';
      btnlogs.style.background = 'white';
      btnlogs.style.color = 'black';

      about.style.display = 'none';
      btnabout.style.background = null;
      btnabout.style.color = null;
      break;
    case 'about':
      service.style.display = 'none';
      btnservice.style.background = null;
      btnservice.style.color = null;

      settings.style.display = 'none';
      btnsettings.style.background = null;
      btnsettings.style.color = null;

      logs.style.display = 'none';
      btnlogs.style.background = null;
      btnlogs.style.color = null;

      about.style.display = 'block';
      btnabout.style.background = 'white';
      btnabout.style.color = 'black';
      break;
    default:
      service.style.display = null;
      btnservice.style.background = null;
      btnservice.style.color = null;

      settings.style.display = null;
      logs.style.display = null;
      about.style.display = null;
      break;
  }
};

window.resolutionChanged = function (elem) {
  document.getElementById('manualres').style.display = elem.value === 'manual' ? 'inline' : 'none';
};

window.socketCheckChanged = function (elem) {
  if (elem.checked === true) {
    document.getElementById('settingaddressport').style.display = 'none';
    document.getElementById('settingsocket').style.display = 'flex';
  } else {
    document.getElementById('settingaddressport').style.display = 'flex';
    document.getElementById('settingsocket').style.display = 'none';
  }
};

window.socketSelectChanged = function (elem) {
  document.getElementById('manualsocket').style.display = elem.value === 'manual' ? 'inline' : 'none';
};

window.toggleAdvanced = function () {
  const settingItemsAdv = document.getElementById('settingItemsAdv');
  const settingItemsNormal = document.getElementById('settingItemsNormal');
  const btnAdvanced = document.getElementById('btnSettingsAdvanced');
  if (settingItemsNormal.style.display === 'block') {
    btnAdvanced.style.background = 'white';
    btnAdvanced.style.color = 'black';
    settingItemsNormal.style.display = 'none';
    settingItemsAdv.style.display = 'block';
  } else {
    btnAdvanced.style.background = null;
    btnAdvanced.style.color = null;
    settingItemsNormal.style.display = 'block';
    settingItemsAdv.style.display = 'none';
  }
};

window.switchLog = function (location) {
  const divConsoleLog = document.getElementById('consoleLog');
  const divHyperionLog = document.getElementById('hyperionLog');
  const btnLogSwitchPicCap = document.getElementById('btnLogSwitchPicCap');
  const btnLogSwitchHyperion = document.getElementById('btnLogSwitchHyperion');

  if (location === 'hyperion') {
    divConsoleLog.style.display = 'none';
    divHyperionLog.style.display = 'block';

    btnLogSwitchHyperion.style.background = 'white';
    btnLogSwitchHyperion.style.color = 'black';
    btnLogSwitchPicCap.style.background = null;
    btnLogSwitchPicCap.style.color = null;
  } else {
    divConsoleLog.style.display = 'block';
    divHyperionLog.style.display = 'none';

    btnLogSwitchPicCap.style.background = 'white';
    btnLogSwitchPicCap.style.color = 'black';
    btnLogSwitchHyperion.style.background = null;
    btnLogSwitchHyperion.style.color = null;
  }
};

/* eslint-enable func-names */
function saveLightMode(color) {
  logIt(`Saving ${color} as light mode.`);
  localStorage.setItem('lightMode', color);
}

/* eslint-disable func-names */
window.switchLightMode = function (color) {
  const btnLightBlue = document.getElementById('btnLightBlue');
  const btnLightDark = document.getElementById('btnLightDark');
  const btnLightBlack = document.getElementById('btnLightBlack');

  switch (color) {
    case 'blue':
      btnLightBlue.style.background = 'white';
      btnLightBlue.style.color = 'black';
      btnLightDark.style.background = null;
      btnLightDark.style.color = null;
      btnLightBlack.style.background = null;
      btnLightBlack.style.color = null;
      document.querySelectorAll('.darkMode, .blackMode').forEach((elem) => elem.classList.add('blueMode'));
      document.querySelectorAll('.darkMode').forEach((elem) => elem.classList.remove('darkMode'));
      document.querySelectorAll('.blackMode').forEach((elem) => elem.classList.remove('blackMode'));
      saveLightMode('blue');
      break;
    case 'dark':
      btnLightBlue.style.background = null;
      btnLightBlue.style.color = null;
      btnLightDark.style.background = 'white';
      btnLightDark.style.color = 'black';
      btnLightBlack.style.background = null;
      btnLightBlack.style.color = null;
      document.querySelectorAll('.blueMode, .blackMode').forEach((elem) => elem.classList.add('darkMode'));
      document.querySelectorAll('.blueMode').forEach((elem) => elem.classList.remove('blueMode'));
      document.querySelectorAll('.blackMode').forEach((elem) => elem.classList.remove('blackMode'));
      saveLightMode('dark');
      break;
    case 'black':
      btnLightBlue.style.background = null;
      btnLightBlue.style.color = null;
      btnLightDark.style.background = null;
      btnLightDark.style.color = null;
      btnLightBlack.style.background = 'white';
      btnLightBlack.style.color = 'black';
      document.querySelectorAll('.blueMode, .darkMode').forEach((elem) => elem.classList.add('blackMode'));
      document.querySelectorAll('.blueMode').forEach((elem) => elem.classList.remove('blueMode'));
      document.querySelectorAll('.darkMode').forEach((elem) => elem.classList.remove('darkMode'));
      saveLightMode('black');
      break;
    default:
      logIt(`${color} not found. Using blue as default.`);
      /* eslint-disable no-undef */
      switchLightMode('blue');
      /* eslint-enable no-undef */
      break;
  }
};

function loadLightMode() {
  const lightMode = localStorage.getItem('lightMode');
  /* eslint-disable no-undef */
  switchLightMode(lightMode);
  /* eslint-enable no-undef */
}

function getJSON(url, callback) {
  const xhr = new XMLHttpRequest();
  xhr.open('GET', url, true);
  xhr.responseType = 'json';

  xhr.onload = function () {
    const { status } = xhr;

    if (status === 200) {
      callback(null, xhr.response);
    } else {
      callback(status);
    }
  };

  xhr.send();
}
/* eslint-enable func-names */

function getContributors(owner, repo) {
  getJSON(`https://api.github.com/repos/${owner}/${repo}/contributors`, (err, data) => {
    if (err != null) {
      console.error(err);
    } else {
      const resp = data;
      let div = document.querySelector('.hyperionwebosContributors');
      if (repo === 'piccap') {
        div = document.querySelector('.piccapContributors');
      }
      const users = resp.map((u) => u.login);
      const avatars = resp.map((a) => a.avatar_url);
      let count = 0;
      let pos = 0;
      let last = document.createElement('ul');
      users.forEach((user) => {
        const lielem = document.createElement('li');
        lielem.setAttribute('id', `li${user}`);
        const pelem = document.createElement('p');

        const imgelem = document.createElement('img');
        imgelem.setAttribute('src', avatars[pos]);
        pos += 1;

        pelem.appendChild(imgelem);
        pelem.innerHTML += user;

        lielem.appendChild(pelem);

        if (count >= 3) {
          const brelem = document.createElement('br');
          div.appendChild(brelem);
          last = document.createElement('ul');
          div.appendChild(last);
          count = 0;
        }
        count += 1;

        last.appendChild(lielem);
        div.appendChild(last);
      });
    }
  });
}
getContributors('webosbrew', 'hyperion-webos');
getContributors('tbsniller', 'piccap');

window.addEventListener('load', () => {
  /* eslint-disable no-undef */
  switchView('service');
  switchLog('piccap');
  loadLightMode();
  /* eslint-enable no-undef */

  const piccapVersion = packageJSON.version;
  document.getElementById('txtPicCapVersion').innerHTML = `v${piccapVersion}`;

  // Initialize Hyperion instances
  /* eslint-disable no-use-before-define */
  loadHyperionInstances();
  /* eslint-enable no-use-before-define */
});

// Hyperion Instance Management Functions
function getHyperionInstances() {
  const instances = localStorage.getItem('hyperionInstances');
  return instances ? JSON.parse(instances) : [];
}

function saveHyperionInstances(instances) {
  localStorage.setItem('hyperionInstances', JSON.stringify(instances));
}

function loadHyperionInstances() {
  const instances = getHyperionInstances();
  const select = document.getElementById('selectHyperionInstance');

  // Clear existing options except manual
  const options = select.querySelectorAll('option');
  options.forEach((option) => {
    if (option.value !== 'manual') {
      option.remove();
    }
  });

  // Add saved instances
  instances.forEach((instance) => {
    const option = document.createElement('option');
    option.value = instance.id;
    option.textContent = instance.name;
    select.appendChild(option);
  });
}

/* eslint-disable func-names */
window.hyperionInstanceChanged = function (select) {
  const instances = getHyperionInstances();
  const selectedInstance = instances.find((instance) => instance.id === select.value);

  if (selectedInstance) {
    document.getElementById('txtInputSettingsAddress').value = selectedInstance.address;
    document.getElementById('txtInputSettingsPort').value = selectedInstance.port;
  }
};

/* eslint-disable no-alert */
window.addHyperionInstance = function () {
  const name = prompt('Enter instance name (e.g., "HyperHDR", "Hyperion.ng"):');
  if (!name) return;

  const address = prompt('Enter IP address:');
  if (!address) return;

  const port = prompt('Enter port number:', '19400');
  if (!port) return;

  const instances = getHyperionInstances();
  const newInstance = {
    id: Date.now().toString(),
    name: name.trim(),
    address: address.trim(),
    port: parseInt(port, 10),
  };

  instances.push(newInstance);
  saveHyperionInstances(instances);
  loadHyperionInstances();

  // Select the new instance
  document.getElementById('selectHyperionInstance').value = newInstance.id;
  /* eslint-disable no-undef */
  hyperionInstanceChanged(document.getElementById('selectHyperionInstance'));
  /* eslint-enable no-undef */
};

window.editHyperionInstance = function () {
  const select = document.getElementById('selectHyperionInstance');
  const selectedId = select.value;

  if (selectedId === 'manual') {
    alert('Please select an instance to edit.');
    return;
  }

  const instances = getHyperionInstances();
  const selectedInstance = instances.find((instance) => instance.id === selectedId);

  if (!selectedInstance) {
    alert('Instance not found.');
    return;
  }

  const name = prompt('Enter instance name:', selectedInstance.name);
  if (!name) return;

  const address = prompt('Enter IP address:', selectedInstance.address);
  if (!address) return;

  const port = prompt('Enter port number:', selectedInstance.port.toString());
  if (!port) return;

  selectedInstance.name = name.trim();
  selectedInstance.address = address.trim();
  selectedInstance.port = parseInt(port, 10);

  saveHyperionInstances(instances);
  loadHyperionInstances();

  // Reselect the edited instance
  document.getElementById('selectHyperionInstance').value = selectedId;
  /* eslint-disable no-undef */
  hyperionInstanceChanged(document.getElementById('selectHyperionInstance'));
  /* eslint-enable no-undef */
};

/* eslint-disable no-restricted-globals */
window.deleteHyperionInstance = function () {
  const select = document.getElementById('selectHyperionInstance');
  const selectedId = select.value;

  if (selectedId === 'manual') {
    alert('Cannot delete the manual entry option.');
    return;
  }

  const instances = getHyperionInstances();
  const selectedInstance = instances.find((instance) => instance.id === selectedId);

  if (!selectedInstance) {
    alert('Instance not found.');
    return;
  }

  if (confirm(`Are you sure you want to delete "${selectedInstance.name}"?`)) {
    const updatedInstances = instances.filter((instance) => instance.id !== selectedId);
    saveHyperionInstances(updatedInstances);
    loadHyperionInstances();

    // Reset to manual
    document.getElementById('selectHyperionInstance').value = 'manual';
  }
};
/* eslint-enable no-restricted-globals */
/* eslint-enable no-alert */
/* eslint-enable func-names */
