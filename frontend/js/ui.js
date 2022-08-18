import axios from 'axios';

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
/* eslint-enable func-names */

function getContributors(owner, repo) {
  axios
    .get(
      `https://api.github.com/repos/${owner}/${repo}/contributors`,
    )
    .then((response) => {
      const resp = response.data;
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
    })
    .catch((error) => console.error(error));
}
getContributors('webosbrew', 'hyperion-webos');
getContributors('tbsniller', 'piccap');

window.addEventListener('load', () => {
  /* eslint-disable no-undef */
  switchView('service');
  /* eslint-enable no-undef */
});
