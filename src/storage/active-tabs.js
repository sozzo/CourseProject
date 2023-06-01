import chrome from "webextension-polyfill";

import {STORAGE_TYPES, StoredDict} from './stored-collections';


class ActiveTabs extends StoredDict {
    CLEANUP_TIMEOUT = 1000 * 60 * 60 * 3; // 3 hours

    get tabs() {
        return this._collection;
    }

    set tabs(tabs) {
        this._collection = tabs;
    }

    async updateLastVisited(tab, rewrite = true) {
        if (tab && !tab.incognito && tab.url) {
            let url = tab.url.split('#')[0];
            if (rewrite || !this.tabs[url]) {
                console.log(`Updating last visited datetime for ${url}`);
                await this.set(url, {lastVisited: Date.now(), markedForCleanup: null});
            }
        }
    }

    async unmarkFromCleanup(tab) {
        if (tab && !tab.incognito && tab.url) {
            let url = tab.url.split('#')[0];
            if (this.tabs[url] && this.tabs[url].markedForCleanup) {
                console.log(`Unmarking ${url} from cleanup`);
                this.tabs[url].markedForCleanup = null;
                await this.save();
            }
        }
    }

    async cleanUp() {
        /*
        Cleanup is done in two steps:
        * 1. Mark all tabs for cleanup
        * 2. Remove all tabs marked for cleanup earlier than 3 hours ago
        This is done to avoid removing tabs that are closed when user closes browser window, because when user reopens
        the window previously closed, we will lose last visited datetime for the tabs otherwise.
         */
        let browserTabs = await chrome.tabs.query({});
        let browserTabUrls = new Set(browserTabs.map(tab => tab.url.split('#')[0]));

        Object.keys(this.tabs).forEach(url => {
            if (!browserTabUrls.has(url)) {
                if (!this.tabs[url].markedForCleanup) {
                    console.log(`Marking ${url} for cleanup`);
                    this.tabs[url].markedForCleanup = Date.now();
                } else if (Date.now() - this.tabs[url].markedForCleanup > this.CLEANUP_TIMEOUT) {
                    console.log(`Removing ${url} from active tabs`);
                    delete this.tabs[url]
                }
            }
        });
        await this.save();
    }

    get pretty() {
        return Object.fromEntries(Object.entries(this.tabs).map(([url, obj]) =>
            [url, {
                markedForCleanup: obj.markedForCleanup ? new Date(obj.markedForCleanup) : null,
                lastVisited: new Date(obj.lastVisited)
            }]
        ));
    }
}

export default new ActiveTabs('activeTabs', {}, STORAGE_TYPES.LOCAL);