var
  kind = require('enyo/kind'),
  Panels = require('moonstone/Panels'),
  IconButton = require('moonstone/IconButton'),
  MainPanel = require('./MainPanel.js');

module.exports = kind({
  name: 'myapp.MainView',
  classes: 'moon enyo-fit main-view',
  components: [
    {
      kind: Panels,
      pattern: 'activity',
      hasCloseButton: false,
      wrap: true,
      popOnBack: true,
      components: [
        {
          kind: MainPanel,
        },
      ],
      onTransitionFinish: 'transitionFinish',
    }
  ],
  create: function () {
    this.inherited(arguments);
  },
  handlers: {
    onRequestPushPanel: 'requestPushPanel',
  },
  transitionFinish: function (evt, sender) {
    document.title = this.$.panels.getActive().title;
  },
  requestPushPanel: function (sender, ev) {
    this.$.panels.pushPanel(ev.panel);
  },
});