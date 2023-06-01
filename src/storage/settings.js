import {STORAGE_TYPES, StoredDict} from "./stored-collections";

class Settings extends StoredDict {
    TAB_LIFETIME_DAYS = 'TAB_LIFETIME_DAYS';
    CLOSE_PINNED_TABS = 'CLOSE_PINNED_TABS';

    static DEFAULT_SETTINGS = {
        TAB_LIFETIME_DAYS: 3,
        CLOSE_PINNED_TABS: true,
    }

    async init(defaultValue = {}) {
        let settings = await this.getFromStorage(defaultValue);
        this._collection = Object.assign({}, defaultValue, settings || {});
        await this.save();
    }
}

export default new Settings('settings', Settings.DEFAULT_SETTINGS, STORAGE_TYPES.SYNC);