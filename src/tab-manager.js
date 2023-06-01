import moment from "moment";
import 'regenerator-runtime/runtime';
import chrome from "webextension-polyfill";

import settings from "./storage/settings";
import closedTabs from "./storage/closed-tabs";
import activeTabs from "./storage/active-tabs";
import domainsWhitelist from "./storage/domains-whitelist";
import urlsWhitelist from "./storage/urls-whitelist";


class TabManager {
  async getWindows() {
    let windows = await chrome.windows.getAll();
    return windows.filter(window => !window.incognito);
  }

  async closeTab(tab) {
    const url = tab.url.split('#')[0];

    // create new tab because closing current tab will close the only Chrome window left
    let windows = await this.getWindows();
    if (windows.length === 1) {
      let tabs = await chrome.tabs.query({windowId: windows[0].id});
      if (tabs.length === 1) {
        await chrome.tabs.create({windowId: windows[0].id});
      }
    }

    try {
      await chrome.tabs.remove(tab.id);
      await closedTabs.add(tab);
      await activeTabs.delete(url);
    } catch (e) {
      console.error(e);
    }
  }

  async checkTabsAndClose(tabs, extraHours = 0) {
    for (const tab of tabs) {
      const url = tab.url.split('#')[0];
      const tabLifetimeDays = settings.get(settings.TAB_LIFETIME_DAYS);

      const tabLastVisited = activeTabs.get(url);
      let expirationDate = moment(tabLastVisited)
        .add(tabLifetimeDays, 'days')
        .add(extraHours, 'hours');
      if (expirationDate < moment(Date.now())) {
        if (!settings.get(settings.CLOSE_PINNED_TABS) && tab.pinned) {
          continue
        }
        let urlObj = new URL(url);
        if (domainsWhitelist.has(urlObj.hostname) || urlsWhitelist.has(url)) {
          continue;
        }
        await this.closeTab(tab);
      }
    }
  }

  async cleanUpBrowserTabs() {
    /*
    Cleanup is performed in two stages.
     1. If tabs are not visible we can close them right away.
     2. If tabs is not focused and wasn't closed for hour after expiration
        user might see them in some cases
     3. If tabs are visible and wasn't closed for two hours after expiration
        we will close them although user will see it
    */
    let allTabs = await chrome.tabs.query({active: false});
    let windows = await this.getWindows()
    windows.forEach(window => {
      const windowTabs = allTabs.filter(tab => tab.windowId === window.id)
      if (window.state === 'minimized') {
        this.checkTabsAndClose(windowTabs);
      } else if (window.state === 'fullscreen') {
        this.checkTabsAndClose(allTabs);
      } else if (window.state === 'maximized' && window.focused) {
        this.checkTabsAndClose(allTabs.filter(tab => tab.windowId !== window.id));
      } else if (!window.focused) {
        this.checkTabsAndClose(windowTabs, 1);
      } else {
        this.checkTabsAndClose(windowTabs, 2);
      }
    })
  }

  async monitorTabs() {
    await this.cleanUpBrowserTabs();
    await activeTabs.cleanUp();
    await closedTabs.cleanUp();
  }
}

export default new TabManager();