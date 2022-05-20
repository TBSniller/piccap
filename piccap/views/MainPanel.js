var
  kind = require('enyo/kind'),
  Panel = require('moonstone/Panel'),
  FittableColumns = require('layout/FittableColumns'),
  BodyText = require('moonstone/BodyText'),
  LunaService = require('enyo-webos/LunaService'),
  Divider = require('moonstone/Divider'),
  Scroller = require('moonstone/Scroller'),
  Item = require('moonstone/Item'),
  Button = require('moonstone/Button'),
  ToggleItem = require('moonstone/ToggleItem'),
  LabeledTextItem = require('moonstone/LabeledTextItem'),
  Dialog = require('moonstone/Dialog'),
  ExpandableInput = require('moonstone/ExpandableInput'),
  ExpandablePicker = require('moonstone/ExpandablePicker');

var serviceName = "org.webosbrew.piccap.service";
var servicePath = "/media/developer/apps/usr/palm/services/" + serviceName;
var autostartFilepath = servicePath + "/piccapautostart";
var linkPath = "/var/lib/webosbrew/init.d/piccapautostart";
var elevationCommand = "/media/developer/apps/usr/palm/services/org.webosbrew.hbchannel.service/elevate-service " + serviceName;
var terminationCommand = "killall -9 hyperion-webos"

var not = function (x) { return !x };
var yes_no_bool = function (x) {
  if (x)
    return "Yes";
  else
    return "No";
}

const sleep = (duration) => {
  return new Promise(resolve => setTimeout(resolve, duration));
}

module.exports = kind({
  name: 'MainPanel',
  kind: Panel,
  title: 'Piccap',
  titleBelow: "WebOS TV screen grabber",
  headerType: 'small',
  components: [
    {
      kind: FittableColumns, classes: 'enyo-stretch', fit: false, components: [
        {
          components: [
            { kind: Divider, content: 'Hyperion connection' },
            {
              components: [
                {
                  classes: 'moon-hspacing', controlClasses: 'moon-4h', components: [
                    {
                      kind: ExpandableInput,
                      name: 'addressInput',
                      content: 'IP address',
                      placeholder: 'IP address or hostname',
                    },
                    {
                      kind: ExpandableInput,
                      name: 'portInput',
                      content: 'Port',
                      placeholder: 'Hyperion flatbuffer port',
                      type: 'number',
                      fit: true,
                    },
                    {
                      kind: ExpandableInput,
                      name: 'sourcePriorityInput',
                      content: 'Source priority',
                      placeholder: 'Priority',
                      type: 'number',
                    }
                  ]
                }
              ]
            },
            { kind: Divider, content: 'Capture settings' },
            {
              classes: 'moon-hspacing', controlClasses: 'moon-4h', components: [
                {
                  kind: ExpandableInput,
                  name: 'widthInput',
                  content: 'Width',
                  placeholder: 'pixels',
                  type: 'number',
                },
                {
                  kind: ExpandableInput,
                  name: 'heightInput',
                  content: 'Height',
                  placeholder: 'pixels',
                  type: 'number',
                },
                {
                  kind: ExpandableInput,
                  name: 'fpsInput',
                  content: 'Max FPS',
                  placeholder: 'FPS',
                  type: 'number',
                }
              ]
            },
            {
              kind: ToggleItem,
              name: 'vsyncToggle',
              content: 'VSync',
              disabled: false
            },
            {
              kind: ExpandablePicker, name: 'videoBackendPicker', noneText: 'None Selected', content: 'Video capture backend', selectedIndex: 0,
              components: [
                { content: 'Automatic detection', backend: 'auto' },
                { content: 'libdile_vt (WebOS 3.x+)', backend: 'libdile_vt' },
                { content: 'libvtcapture (WebOS 5.x+)', backend: 'libvtcapture' },
                { content: 'Disabled', backend: 'disabled' }
              ]
            },
            {
              kind: ExpandablePicker, name: 'uiBackendPicker', noneText: 'None Selected', content: 'Graphic capture backend', selectedIndex: 0,
              components: [
                { content: 'Automatic detection', backend: 'auto' },
                { content: 'libgm (WebOS 3.x+)', backend: 'libgm' },
                { content: 'libhalgal (WebOS 5.x+)', backend: 'libhalgal' },
                { content: 'Disabled', backend: 'disabled' }
              ]
            },
            {
              kind: ToggleItem,
              name: 'autostartToggle',
              content: 'Autostart',
              checked: false,
              disabled: false
            },
          ]
        },
        {
          kind: Scroller, fit: true, components: [
            { kind: Divider, content: 'Service info' },
            {
              classes: 'moon-hspacing', controlClasses: 'moon-6h', components: [
                {
                  components: [
                    {
                      kind: LabeledTextItem,
                      name: 'versionStatus',
                      label: 'Version',
                      disabled: true,
                    },
                    {
                      kind: LabeledTextItem,
                      name: 'daemonStatus',
                      label: 'State',
                      disabled: true,
                    },
                    {
                      kind: LabeledTextItem,
                      name: 'elevatedStatus',
                      label: 'Root',
                      disabled: true,
                    }
                  ]
                },
                {
                  components: [
                    {
                      kind: LabeledTextItem,
                      name: 'videoBackendStatus',
                      label: 'Video',
                      disabled: true,
                    },
                    {
                      kind: LabeledTextItem,
                      name: 'graphicsBackendStatus',
                      label: 'Graphic',
                      disabled: true,
                    },
                    {
                      kind: LabeledTextItem,
                      name: 'fpsStatus',
                      label: 'FPS',
                      disabled: true,
                    },
                  ]
                },
              ]
            },
            { kind: Divider, content: 'Service control' },
            {
              classes: 'moon-hspacing', controlClasses: 'moon-4h', components: [
                { kind: Item, name: 'startButton', content: 'Start', ontap: "start" },
                { kind: Item, name: 'stopButton', content: 'Stop', ontap: "stop" },
                { kind: Item, name: 'terminateButton', content: 'Terminate', ontap: "terminate" }
              ]
            },
            { kind: Divider, content: 'Settings' },
            {
              classes: 'moon-hspacing', controlClasses: 'moon-4h', components: [
                { kind: Item, name: 'saveButton', content: 'Save', ontap: "saveSettings" },
                { kind: Item, name: 'resetButton', content: 'Reset', ontap: "resetSettings" },
              ]
            },
            { kind: Divider, content: 'System' },
            { kind: Item, name: 'rebootButton', content: 'Reboot', ontap: "reboot" },
          ]
        }
      ]
    },
    {
      components: [
        { kind: Divider, content: 'Result' },
        { kind: BodyText, name: 'result', content: 'Nothing selected...', showCloseButton: true },
      ]
    },
    { 
      kind: Dialog,
      name: 'restartDialog',
      title: 'Restart required',
      subTitle: 'Native service was terminated after elevation. Please reboot.',
      modal: true,
      autoDismiss: false,
      components: [
        {name: 'okRestart', kind: Button, content: 'OK', ontap: 'reboot'},
        {name: 'cancelRestart', kind: Button, content: 'Cancel', ontap: 'hideRestartDialog'}
      ]
    },
    { kind: LunaService, name: 'serviceStatus', service: 'luna://org.webosbrew.piccap.service', method: 'status', onResponse: 'onServiceStatus', onError: 'onServiceStatus' },
    { kind: LunaService, name: 'start', service: 'luna://org.webosbrew.piccap.service', method: 'start', onResponse: 'onDaemonStart', onError: 'onDaemonStart' },
    { kind: LunaService, name: 'stop', service: 'luna://org.webosbrew.piccap.service', method: 'stop', onResponse: 'onDaemonStop', onError: 'onDaemonStop' },
    { kind: LunaService, name: 'getSettings', service: 'luna://org.webosbrew.piccap.service', method: 'getSettings', onResponse: 'onGetSettings', onError: 'onGetSettings' },
    { kind: LunaService, name: 'setSettings', service: 'luna://org.webosbrew.piccap.service', method: 'setSettings', onResponse: 'onSetSettings', onError: 'onSetSettings' },

    { kind: LunaService, name: 'exec', service: 'luna://org.webosbrew.hbchannel.service', method: 'exec', onResponse: 'onExec', onError: 'onExec' },
    { kind: LunaService, name: 'terminate', service: 'luna://org.webosbrew.hbchannel.service', method: 'exec', onResponse: 'onTermination', onError: 'onTermination' },
    { kind: LunaService, name: 'execSilent', service: 'luna://org.webosbrew.hbchannel.service', method: 'exec' },
    { kind: LunaService, name: 'systemReboot', service: 'luna://org.webosbrew.hbchannel.service', method: 'reboot' },
  ],

  address: '127.0.0.1',
  port: 19400,
  sourcePriority: 150,
  width: 192,
  height: 108,
  fps: 30,
  autostart: false,
  vsync: false,

  resultText: 'unknown',
  status: {
    version: "unknown",
    daemonStatus: "unknown",
    videoBackend: "unknown",
    graphicBackend: "unknown",
    fps: "unknown",
    elevated: "unknown"
  },


  bindings: [
    // Settings
    { from: "address", to: '$.addressInput.value' },
    { from: "port", to: '$.portInput.value' },
    { from: "sourcePriority", to: '$.sourcePriorityInput.value' },
    { from: "port", to: '$.portInput.value' },
    { from: "width", to: '$.widthInput.value' },
    { from: "height", to: '$.heightInput.value' },
    { from: "fps", to: '$.fpsInput.value' },
    { from: "vsync", to: '$.vsyncToggle.checked' },

    // Status
    { from: "status.version", to: '$.versionStatus.text' },
    { from: "status.daemonStatus", to: '$.daemonStatus.text' },
    { from: "status.videoBackend", to: '$.videoBackendStatus.text' },
    { from: "status.graphicsBackend", to: '$.graphicsBackendStatus.text' },
    { from: "status.fps", to: '$.fpsStatus.text' },
    { from: "status.elevated", to: '$.elevatedStatus.text' }
  ],

  create: function () {
    this.inherited(arguments);
    console.info("Application created");
    // At first, elevate the native service
    // It does not do harm if service is elevated already
    this.elevate();
    this.set('resultText', 'Checking service status...');
    this.$.serviceStatus.send({});
  },
  // Elevates the native service - this enables org.webosbrew.piccap.service to run as root by default
  elevate: function () {
    console.info("Sending elevation command");
    this.$.execSilent.send({ command: elevationCommand });
  },
  terminate: function() {
    console.info("Sending service kill command");
    this.$.terminate.send({ command: terminationCommand })
  },
  hideRestartDialog: function() {
    this.$.restartDialog.hide();
  },
  reboot: function () {
    console.info("Sending reboot command");
    this.$.systemReboot.send({ reason: 'SwDownload' });
  },
  start: function () {
    console.info("Start clicked");
    this.$.restartDialog.show();
    this.$.start.send({});
  },
  stop: function () {
    console.info("Stop clicked");
    this.$.stop.send({});
  },
  exec: function (command) {
    console.info("exec called");
    console.info(command);
    this.set('resultText', 'Processing...');
    this.$.exec.send({
      command: command,
    });
  },
  saveSettings: function () {
    console.info("Save settings clicked");

    var noVideo = false;
    var noGui = false;

    var videoBackend = this.$.videoBackendPicker.getSelected().backend;
    var uiBackend = this.$.uiBackendPicker.getSelected().backend;
    console.log("Chosen videobackend: " + videoBackend);
    console.log("Chosen uiBackend: " + uiBackend);

    if (videoBackend == "disabled") {
      videoBackend = "auto";
      noVideo = true;
      console.log("Setting: novideo");
    }

    if (uiBackend == "disabled") {
      uiBackend = "auto";
      noGui = true;
      console.log("Setting: nogui");
    }

    var settings = {
      address: address,
      port: port,
      priority: sourcePriority,
      fps: fps,
      width: width,
      height: height,
      vsync: vsync,
      backend: videoBackend,
      uibackend: uiBackend,
      novideo: noVideo,
      nogui: noGui,
      autostart: autostart,
    }

    this.$.setSettings.send(settings);
  },
  resetSettings: function () {
    console.info("Reset settings clicked");
    this.$.getSettings.send();
  },
  onExec: function (sender, evt) {
    console.info("onExec");
    console.info(evt);
    if (evt.returnValue) {
      this.set('resultText', 'Success!<br />' + evt.stdoutString + evt.stderrString);
    } else {
      this.set('resultText', 'Failed: ' + evt.errorText + ' ' + evt.stdoutString + evt.stderrString);
    }
  },
  onTermination: function (sender, evt) {
    console.info("onTermination");
    console.info(sender, evt);

    if (evt.returnValue) {
      this.set('resultText', 'Successfully terminated native service!');
      this.$.restartDialog.show();
    } else {
      this.set('resultText', 'Failed to terminate native service!');
    }
  },
  onServiceStatus: function (sender, evt) {
    console.info("onServiceStatus");
    console.info(sender, evt);

    if (!evt.returnValue) {
      this.set('resultText', "Failed to get service status!");
      return;
    }

    var state = (evt.isRunning ? "Running" : "Not running") + " - " + (evt.connected ? "Connected" : "Disconnected");

    this.set('status.version', evt.version);
    this.set('status.elevated', evt.elevated);
    this.set('status.daemonStatus', state);
    this.set('status.connected', evt.connected);
    this.set('status.videoBackend', evt.videoBackend + " - " + (evt.videoRunning ? "Active" : "Inactive"));
    this.set('status.graphicsBackend', evt.uiBackend + " - " + (evt.uiRunning ? "Active" : "Inactive"));
    this.set('status.fps', evt.framerate);

    if (evt.elevated) {
      this.$.resetSettings.send(settings);
    } else {
      this.terminate();
    }

    this.set('resultText', 'Service status received..');
  },
  onSetSettings: function (sender, evt) {
    console.info("onSetSettings");

    if (!evt.returnValue) {
      this.set('resultText', "Failed to save settings!");
      return;
    }

    this.set('resultText', "Settings saved!");
  },
  onGetSettings: function (sender, evt) {
    console.info("onGetSettings");

    if (!evt.returnValue) {
      this.set('resultText', "Failed to get settings!");
      return;
    }

    var videoBackend = evt.video_backend ? evt.video_backend : "auto";
    var uiBackend = evt.ui_backend ? evt.ui_backend : "auto";

    if (evt.no_video) {
      videoBackend = "disabled";
    }

    if (evt.no_gui) {
      uiBackend = "disabled";
    }

    var videoBackendChoices = this.$.videoBackendPicker.components;
    for (let i = 0; i < videoBackendChoices.length; i++ ) {
      if (videoBackendChoices[i].backend == videoBackend) {
        this.$.videoBackendPicker.selectedIndex = i;
        break;
      }
    }

    var uiBackendChoices = this.$.uiBackendPicker.components;
    for (let i = 0; i < uiBackendChoices.length; i++ ) {
      if (uiBackendChoices[i].backend == uiBackend) {
        this.$.uiBackendPicker.selectedIndex = i;
        break;
      }
    }

    this.set('address', evt.address);
    this.set('port', evt.port);
    this.set('priority', evt.priority);
    this.set('sourcePriority', evt.priority)
    this.set('fps', evt.fps);
    this.set('width', evt.width);
    this.set('height', evt.height);
    this.set('vsync', evt.vsync);

    this.set('autostart', evt.autostart);

    this.set('resultText', "Settings reset!");
  },
  onDaemonStart: function (sender, evt) {
    console.info("onDaemonStart");
    if (evt.returnValue) {
      this.set('daemonRunning', true);
      this.set('resultText', "Daemon started");
    } else {
      this.set('resultText', "Daemon failed to start");
    }
  },
  onDaemonStop: function (sender, evt) {
    console.info("onDaemonStop");
    if (evt.returnValue) {
      this.set('daemonRunning', false);
      this.set('resultText', "Daemon stopped");
    } else {
      this.set('resultText', "Daemon failed to stop");
    }
  },
});