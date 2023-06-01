import chrome from "webextension-polyfill";

import tabManager from "./tab-manager";
import activeTabs from "./storage/active-tabs";
import processMessage from "./message-processor";
import {setLastTabToRemove, populateClosedTabs} from "./test_utils";


async function onInstalled() {
    let tabs = await chrome.tabs.query({windowType: 'normal'})
    tabs.forEach(tab => {
        activeTabs.updateLastVisited(tab, false);
    });
}
chrome.runtime.onInstalled.addListener(onInstalled);

export async function onTabUpdated(tabId, changeInfo, tab) {
    if (tab.active && 'status' in changeInfo && changeInfo.status === 'loading') {
        await activeTabs.updateLastVisited(tab);
    }
}
chrome.tabs.onUpdated.addListener(onTabUpdated);

export async function onTabActivated(activeInfo) {
    let tab = await chrome.tabs.get(activeInfo.tabId);
    await activeTabs.updateLastVisited(tab);
}
chrome.tabs.onActivated.addListener(onTabActivated);


chrome.windows.onFocusChanged.addListener(async function () {
    await tabManager.monitorTabs();
});

chrome.windows.onCreated.addListener(async function (window) {
    if (!window.incognito) {
        let tabs = await chrome.tabs.query({windowId: window.id});
        tabs.forEach(tab => {
            activeTabs.updateLastVisited(tab, false);
            activeTabs.unmarkFromCleanup(tab)
        });
    }
    if (window.state === 'maximized' || window.state === 'fullscreen') {
        await tabManager.monitorTabs();
    }
});
async function onTabGroupUpdated(tabGroup) {
    if (tabGroup.collapsed) {
        // TODO
    }
}
// chrome.tabGroups.onUpdated.addListener(onTabGroupUpdated);

chrome.runtime.onMessage.addListener(processMessage);