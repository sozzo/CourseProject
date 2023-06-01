import {STORAGE_TYPES, StoredArray} from './stored-collections';
import moment from "moment";

class ClosedTabs extends StoredArray {
    CLOSED_TABS_RETENTION_DAYS = 3;

    constructor(storageKey, defaultValue, storageType) {
        super(storageKey, defaultValue, storageType);
    }

    async init(defaultValue) {
        await super.init(defaultValue);
    }

    get tabs() {
        return this._collection;
    }

    set tabs(tabs) {
        this._collection = tabs;
    }

    async add(tabs) {
        if (!Array.isArray(tabs)) {
            tabs = [tabs];
        }
        tabs = tabs.filter(tab => tab.url).map(tab => {
            return {
                url: tab.url,
                title: tab.title,
                faviconUrl: tab.favIconUrl,
                datetime: Date.now(),
            };
        });
        await super.push(tabs);
    }

    async cleanUp() {
        this.tabs = this.tabs.filter(tab => {
            let expirationDate = moment(tab.datetime).add(this.CLOSED_TABS_RETENTION_DAYS, 'days');
            return expirationDate > moment(Date.now());
        });
        await this.save()
    }

    get groupedByDate() {
        const groupedTabs = {};
        let tabs = this.tabs.slice().reverse();
        const today = moment().startOf('day');
        const yesterday = moment().subtract(1, 'days').startOf('day');

        for (let tab of tabs) {
            tab = {...tab};
            const tabDate = moment(tab.datetime);
            let group;

            if (tabDate.isSame(today, 'd')) {
                group = 'today';
            } else if (tabDate.isSame(yesterday, 'd')) {
                group = 'yesterday';
            } else {
                group = 'earlier';
            }

            if (!groupedTabs[group]) {
                groupedTabs[group] = [];
            }
            tab.time = moment(tab.datetime).format('HH:mm');
            groupedTabs[group].push(tab);
        }
        return new Map(Object.entries(groupedTabs));
    }

    async removeByUrl(url) {
        this.tabs = this.tabs.filter(tab => tab.url !== url);
        await this.save();
    }
}

export default new ClosedTabs('closedTabs', [], STORAGE_TYPES.LOCAL);