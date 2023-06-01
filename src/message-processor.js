import closedTabs from './storage/closed-tabs';
import domainsWhitelist from './storage/domains-whitelist';
import urlsWhitelist from './storage/urls-whitelist';
import settings from './storage/settings';

const processors = {
    'reload-settings': reloadSettings,
    'reload-closed-tabs': reloadClosedTabs,
    'reload-domains-whitelist': reloadDomainsWhitelist,
    'reload-urls-whitelist': reloadUrlsWhitelist,
}

async function reloadSettings(message) {
    return await settings.init();
}

async function reloadClosedTabs(message) {
    return await closedTabs.init();
}

async function reloadDomainsWhitelist(message) {
    return await domainsWhitelist.init();
}

async function reloadUrlsWhitelist(message) {
    return await urlsWhitelist.init();
}

async function processMessage(message, sender, sendResponse) {
    console.log('Processing message', message);
    return await processors[message.action](message);
}

export default processMessage;