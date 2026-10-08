const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

const root = path.join(__dirname, '..');
const markup = fs.readFileSync(path.join(root, 'frontend/index.html'), 'utf8');
const ui = fs.readFileSync(path.join(root, 'frontend/js/ui.js'), 'utf8')
  .replace(/^import packageJSON from .*;\r?\n/, '');
const servicecalls = fs.readFileSync(path.join(root, 'frontend/js/servicecalls.js'), 'utf8');

// Exercise the real UI and service callbacks with an in-memory Luna service.
// Network contributor lookups and startup timers are excluded from settings tests.
function app() {
  const elements = new Map();
  const requests = [];
  const context = {
    packageJSON: JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8')),
    console: { log() {}, error() {} },
    require(name) {
      assert.equal(name, 'core-js/stable');
    },
    XMLHttpRequest: function MockXHR() {
      this.open = () => {};
      this.send = () => {};
    },
    addEventListener() {},
    document: {
      getElementById(id) {
        if (!elements.has(id)) {
          assert.ok(markup.includes(`id="${id}"`), `unknown control ${id}`);
          const select = markup.match(new RegExp(`<select[^>]*id="${id}"[^>]*>([\\s\\S]*?)</select>`));
          const options = select ? Array.from(select[1].matchAll(/<option value="([^"]+)"/g), (match) => ({ value: match[1] })) : [];
          elements.set(id, {
            value: options.length ? options[0].value : '',
            checked: false,
            options,
            style: { display: 'none' },
          });
        }
        return elements.get(id);
      },
    },
    webOS: {
      service: {
        request(uri, request) {
          assert.equal(uri, 'luna://org.webosbrew.piccap.service');
          requests.push(request);
        },
      },
    },
  };
  context.window = context;
  vm.createContext(context);
  vm.runInContext(ui, context, { filename: 'ui.js' });
  vm.runInContext(servicecalls, context, { filename: 'servicecalls.js' });

  return {
    element: context.document.getElementById,
    load(overrides = {}) {
      context.serviceReload();
      const request = requests.pop();
      assert.equal(request.method, 'getSettings');
      request.onSuccess({
        returnValue: true,
        address: '127.0.0.1',
        'unix-socket': false,
        port: 19400,
        priority: 150,
        width: 320,
        height: 180,
        fps: 30,
        quirks: 0,
        ...overrides,
      });
    },
    save() {
      context.serviceSaveSettings();
      const request = requests.pop();
      assert.equal(request.method, 'setSettings');
      return request.parameters;
    },
  };
}

test('loading custom dimensions reveals manual inputs and preserves them on save', () => {
  const page = app();
  page.load({ width: 128, height: 72 });
  assert.equal(page.element('selectSettingsResolution').value, 'manual');
  assert.equal(page.element('manualres').style.display, 'inline');
  const saved = page.save();
  assert.equal(saved.width, 128);
  assert.equal(saved.height, 72);
});

test('matching pixel area does not replace a custom aspect ratio with a preset', () => {
  const page = app();
  page.load({ width: 240, height: 240 }); // Same area as 320x180.
  assert.equal(page.element('selectSettingsResolution').value, 'manual');
  const saved = page.save();
  assert.equal(saved.width, 240);
  assert.equal(saved.height, 240);
});

test('loading a preset after manual settings hides manual fields again', () => {
  const page = app();
  page.load({ width: 128, height: 72 });
  page.load({ width: 256, height: 144 });
  assert.equal(page.element('selectSettingsResolution').value, '256x144');
  assert.equal(page.element('manualres').style.display, 'none');
  const saved = page.save();
  assert.equal(saved.width, 256);
  assert.equal(saved.height, 144);
});

test('each existing capture preset survives a load-save cycle', () => {
  for (const [width, height] of [[320, 180], [256, 144], [192, 108], [128, 78]]) {
    const page = app();
    page.load({ width, height });
    assert.equal(page.element('selectSettingsResolution').value, `${width}x${height}`);
    const saved = page.save();
    assert.equal(saved.width, width);
    assert.equal(saved.height, height);
  }
});

test('custom local socket paths survive settings reload and save', () => {
  const page = app();
  page.load({ address: '/tmp/custom-hyperhdr.sock', 'unix-socket': true });
  assert.equal(page.element('selectSettingsSocket').value, 'manual');
  assert.equal(page.element('manualsocket').style.display, 'inline');
  assert.equal(page.element('txtInputSettingsSocketPath').value, '/tmp/custom-hyperhdr.sock');
  assert.equal(page.element('txtInputSettingsAddress').value, '127.0.0.1');
  const saved = page.save();
  assert.equal(saved.address, '/tmp/custom-hyperhdr.sock');
  assert.equal(saved['unix-socket'], true);
});

test('the HyperHDR socket preset remains selectable', () => {
  const page = app();
  page.load({ address: '/tmp/hyperhdr-domain', 'unix-socket': true });
  assert.equal(page.element('selectSettingsSocket').value, 'hyperhdr');
  assert.equal(page.element('manualsocket').style.display, 'none');
  assert.equal(page.save().address, '/tmp/hyperhdr-domain');
});

test('an unset address loads the local TCP default without throwing', () => {
  const page = app();
  page.load({ address: undefined });
  assert.equal(page.element('txtInputSettingsAddress').value, '127.0.0.1');
  assert.equal(page.save().address, '127.0.0.1');
});

test('loading settings clears stale capture quirks', () => {
  const page = app();
  page.load({ quirks: 0x102 });
  assert.equal(page.element('checkSettingsQUIRK_DILE_VT_NO_FREEZE_CAPTURE').checked, true);
  assert.equal(page.element('checkSettingsQUIRK_VTCAPTURE_FORCE_CAPTURE').checked, true);
  page.load({ quirks: 0 });
  assert.equal(page.element('checkSettingsQUIRK_DILE_VT_NO_FREEZE_CAPTURE').checked, false);
  assert.equal(page.element('checkSettingsQUIRK_VTCAPTURE_FORCE_CAPTURE').checked, false);
  assert.equal(page.save().quirks, 0);
});
