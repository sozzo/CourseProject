import {chrome} from "jest-chrome";

jest.mock('webextension-polyfill', () => require('jest-chrome').chrome)

import activeTabs from "../src/storage/active-tabs";
import {onTabActivated, onTabUpdated} from "../src/listeners";

describe("listeners.js", () => {
  beforeEach(function () {
    chrome.storage.local.clear()
    chrome.storage.sync.clear()
    activeTabs.tabs = {};
  });
  const tabUrl = "https://www.google.com";
  const dateNowMockValue = 1234567890;

  describe("chrome.tabs.onUpdated", () => {
    it("should update tab last visited datetime when user switches to it", async () => {
      jest.spyOn(Date, 'now').mockImplementation(() => dateNowMockValue);
      await onTabUpdated(1, {status: "loading"}, {
        active: true,
        incognito: false,
        url: tabUrl
      });
      expect(activeTabs.tabs[tabUrl].lastVisited).toBe(dateNowMockValue);
    });

    it("should not update tab last visited datetime when status of tab is not 'loading'", async () => {
      await onTabUpdated(1, {status: "complete"}, {
        active: true,
        incognito: false,
        url: tabUrl
      });
      expect(activeTabs.tabs[tabUrl]).toBe(undefined);
    });

    it("should not update tab last visited datetime when tab is not active", async () => {
      await onTabUpdated(1, {status: "loading"}, {
        active: false,
        incognito: false,
        url: tabUrl
      });
      expect(activeTabs.tabs[tabUrl]).toBe(undefined);
    });

    it("should not update tab last visited datetime when tab is incognito", async () => {
      await onTabUpdated(1, {status: "loading"}, {
        active: true,
        incognito: true,
        url: tabUrl
      });
      expect(activeTabs.tabs[tabUrl]).toBe(undefined);
    });
  });

  describe("chrome.tabs.onActivated", () => {
    it("should update tab last visited datetime when user switches to it", async () => {
      jest.spyOn(Date, 'now').mockImplementation(() => dateNowMockValue);
      jest.spyOn(chrome.tabs, "get").mockImplementation(() =>
        Promise.resolve({
          tabId: 1,
          active: true,
          incognito: false,
          url: tabUrl
        })
      );
      await onTabActivated({tabId: 1});
      expect(activeTabs.tabs[tabUrl].lastVisited).toBe(dateNowMockValue);
    });
  });
});