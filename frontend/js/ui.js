import packageJSON from '../../package.json';
//import logIt from './servicecalls';

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
});
