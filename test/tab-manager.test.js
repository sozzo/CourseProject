import {chrome} from "jest-chrome";

jest.mock('webextension-polyfill', () => require('jest-chrome').chrome)
import moment from 'moment';

import tabManager from '../src/tab-manager';
import closedTabs from "../src/storage/closed-tabs";
import activeTabs from "../src/storage/active-tabs";
import settings from "../src/storage/settings";
import domainsWhitelist from "../src/storage/domains-whitelist";
import urlsWhitelist from "../src/storage/urls-whitelist";

// Mock the methods for settings
jest.spyOn(settings, 'get').mockImplementation(() => {
});

// Mock the methods for closedTabs
closedTabs.add = jest.fn();
closedTabs.cleanUp = jest.fn();

// Mock the methods for activeTabs
activeTabs.get = jest.fn();
activeTabs.delete = jest.fn();
activeTabs.cleanUp = jest.fn();

// Replace the domainsWhitelist with a new Set instance

domainsWhitelist.get = jest.fn();

const createWindow = (id, incognito = false) => ({
  id,
  incognito,
});

const createTab = (id, windowId, url, active, pinned) => ({
  id,
  windowId,
  url,
  active,
  pinned,
});

describe('TabCleaner', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getWindows()', () => {
    test('returns only non-incognito windows', async () => {
      const nonIncognitoWindow1 = createWindow(1);
      const nonIncognitoWindow2 = createWindow(2);
      const incognitoWindow = createWindow(3, true);

      chrome.windows.getAll.mockResolvedValue([
        nonIncognitoWindow1,
        nonIncognitoWindow2,
        incognitoWindow,
      ]);

      const windows = await tabManager.getWindows();
      expect(windows).toHaveLength(2);
      expect(windows).toContain(nonIncognitoWindow1);
      expect(windows).toContain(nonIncognitoWindow2);
      expect(windows).not.toContain(incognitoWindow);
    });

    test('returns an empty array when there are no non-incognito windows', async () => {
      chrome.windows.getAll.mockResolvedValue([]);

      const windows = await tabManager.getWindows();
      expect(windows).toHaveLength(0);
    });
  });

  describe('closeTab()', () => {
    test('closes the tab and updates storage', async () => {
      const tab = createTab(1, 1, 'http://example.com', false, false);
      const newTab = createTab(2, 1, 'chrome://newtab', false, false);
      chrome.tabs.create.mockResolvedValue(newTab);

      await tabManager.closeTab(tab);

      expect(chrome.tabs.remove).toHaveBeenCalledWith(tab.id);
      expect(closedTabs.add).toHaveBeenCalledWith(tab);
      expect(activeTabs.delete).toHaveBeenCalledWith(tab.url.split('#')[0]);
    });
  });
  test('creates a new tab if the last tab in the only window is being closed', async () => {
    const window = createWindow(1);
    const tab = createTab(1, window.id, 'http://example.com', false, false);
    const newTab = createTab(2, window.id, 'chrome://newtab', false, false);
    chrome.windows.getAll.mockResolvedValue([window]);
    chrome.tabs.query.mockResolvedValue([tab]);
    chrome.tabs.create.mockResolvedValue(newTab);

    await tabManager.closeTab(tab);

    expect(chrome.tabs.create).toHaveBeenCalledWith({windowId: window.id});
    expect(chrome.tabs.remove).toHaveBeenCalledWith(tab.id);
    expect(closedTabs.add).toHaveBeenCalledWith(tab);
    expect(activeTabs.delete).toHaveBeenCalledWith(tab.url.split('#')[0]);
  });

  describe('checkTabsAndClose()', () => {
    test('closes expired tabs and skips pinned tabs if CLOSE_PINNED_TABS setting is disabled', async () => {
      const nonPinnedTab = createTab(1, 1, 'http://non-pinned.com', false, false);
      const pinnedTab = createTab(2, 1, 'http://pinned.com', false, true);
      settings.get.mockImplementation((key) => {
        if (key === settings.TAB_LIFETIME_DAYS) return 1;
        if (key === settings.CLOSE_PINNED_TABS) return false;
      });
      activeTabs.get.mockReturnValue(moment().subtract(2, 'days').valueOf());

      const closeTabSpy = jest.spyOn(tabManager, 'closeTab');

      await tabManager.checkTabsAndClose([nonPinnedTab, pinnedTab]);

      expect(closeTabSpy).toHaveBeenCalledTimes(1);
      expect(closeTabSpy).toHaveBeenCalledWith(nonPinnedTab);
    });

    test('skips tabs present in domainsWhitelist or urlsWhitelist', async () => {
      const whitelistedDomainTab = createTab(4, 1, 'http://whitelisted-domain.com/path', false, false);
      const whitelistedUrlTab = createTab(5, 1, 'http://whitelisted-url.com/path', false, false);
      const nonWhitelistedTab = createTab(6, 1, 'http://whitelisted-url.com/path1', false, false);

      const closeTabSpy = jest.spyOn(tabManager, 'closeTab');

      domainsWhitelist.add('whitelisted-domain.com');
      urlsWhitelist.add('whitelisted-url.com/path');

      settings.get.mockReturnValue(1);
      activeTabs.get.mockReturnValue(moment().subtract(2, 'days').valueOf());

      await tabManager.checkTabsAndClose([whitelistedDomainTab, whitelistedUrlTab, nonWhitelistedTab]);

      expect(closeTabSpy).toHaveBeenCalledTimes(2);
      expect(closeTabSpy).toHaveBeenCalledWith(nonWhitelistedTab);
    });
  });

  describe('monitorTabs()', () => {
    test('calls cleanUpBrowserTabs, activeTabs.cleanUp, and closedTabs.cleanUp', async () => {
      const cleanUpBrowserTabsSpy = jest.spyOn(tabManager, 'cleanUpBrowserTabs');
      await tabManager.monitorTabs();

      expect(cleanUpBrowserTabsSpy).toHaveBeenCalled();
      expect(activeTabs.cleanUp).toHaveBeenCalled();
      expect(closedTabs.cleanUp).toHaveBeenCalled();
    });
  });
});