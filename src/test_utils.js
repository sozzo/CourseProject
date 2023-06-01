import chrome from "webextension-polyfill";
import moment from "moment/moment";
import settings from "../src/storage/settings";
import closedTabs from "../src/storage/closed-tabs";
import activeTabs from "../src/storage/active-tabs";
import domainsWhitelist from "./storage/domains-whitelist";
import urlsWhitelist from "./storage/urls-whitelist";

async function setLastTabToRemove() {
    let tabs = await chrome.tabs.query({});
    let tabToDelete = tabs.filter(tab => !tab.incognito && tab.url).slice(-1)[0];
    let newLastVisitedValue = moment(Date.now()).subtract(settings.get(settings.TAB_LIFETIME_DAYS) + 1, 'days').valueOf();
    await activeTabs.set(tabToDelete.url, newLastVisitedValue);
    console.log(`Set ${tabToDelete.title} last visited datetime to ${new Date(newLastVisitedValue)}`)
}

async function populateClosedTabs() {
    await closedTabs.add(await chrome.tabs.query({}))
}

global.moment = moment;
global.setLastTabToRemove = setLastTabToRemove;
global.populateClosedTabs = populateClosedTabs;
global.settings = settings;
global.closedTabs = closedTabs;
global.activeTabs = activeTabs;
global.domainsWhitelist = domainsWhitelist;
global.urlsWhitelist = urlsWhitelist;

export {setLastTabToRemove, populateClosedTabs};