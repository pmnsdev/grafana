///<reference path="../../../headers/common.d.ts" />

import _ from 'lodash';
import config from 'app/core/config';
import {PanelCtrl} from '../../../features/panel/panel_ctrl';

// Set and populate defaults
var panelDefaults = {
};

class DashListCtrl extends PanelCtrl {
  static templateUrl = 'module.html';

  pluginList: any[];
  viewModel: any;

  /** @ngInject */
  constructor($scope, $injector, private backendSrv) {
    super($scope, $injector);
    _.defaults(this.panel, panelDefaults);

    this.events.on('init-edit-mode', this.onInitEditMode.bind(this));
    this.pluginList = [];
    this.viewModel = [
      {header: "Installed Apps", list: [], type: 'app'},
      {header: "Installed Panels", list: [], type: 'panel'},
      {header: "Installed Datasources", list: [], type: 'datasource'},
    ];
    this.update();
  }

  onInitEditMode() {
    this.editorTabIndex = 1;
    this.addEditorTab('Options', 'public/app/plugins/panel/pluginlist/editor.html');
  }

  update() {
    this.backendSrv.get('api/plugins', {embedded: 0, core: 0}).then(plugins => {
      this.pluginList = plugins;
      this.viewModel[0].list = _.filter(plugins, {type: 'app'});
      this.viewModel[1].list = _.filter(plugins, {type: 'panel'});
      this.viewModel[2].list = _.filter(plugins, {type: 'datasource'});

      for (let plugin of this.pluginList) {
        if (!plugin.enabled) {
          plugin.state = 'not-enabled';
        }
      }

    }).then(this.checkForUpdates.bind(this));
  }

  checkForUpdates() {
    return this.backendSrv.get('api/gnet/plugins/repo').then(data => {
      var gNetPlugins = _.reduce(data.plugins, (memo, val) => {
        memo[val.id] = val;
        return memo;
      }, {});

      for (let plugin of this.pluginList) {
        var source = gNetPlugins[plugin.id];
        if (!source) {
          continue;
        }

        if (plugin.info.version !== source.versions[0].version) {
          plugin.hasUpdate = true;
          plugin.state = 'has-update';
        }
      }
    });
  }
}

export {DashListCtrl, DashListCtrl as PanelCtrl}
