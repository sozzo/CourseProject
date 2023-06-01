import chrome from "webextension-polyfill";

const STORAGE_TYPES = {
    LOCAL: 'local',
    SYNC: 'sync',
}

class StoredCollection {
    constructor(storageKey, defaultValue, storageType) {
        this._collection = defaultValue;
        this.storageKey = storageKey;
        this.storage = chrome.storage[storageType || STORAGE_TYPES.LOCAL];
        this.init(defaultValue);
    }

    async init(defaultValue) {
        this._collection = await this.getFromStorage(defaultValue);
        await this.save();
    }

    async getFromStorage(defaultValue) {
        let obj = await this.storage.get(this.storageKey);
        // because chrome storage api has weird behaviour with get method
        if (obj && obj[this.storageKey]) {
            return obj[this.storageKey];
        }
        return defaultValue;
    }

    get storedObject() {
        return this._collection;
    }

    async save() {
        await this.storage.set({[this.storageKey]: this.storedObject});
    }
}

class StoredArray extends StoredCollection {
    async push(items) {
        if (!Array.isArray(items)) {
            items = [items];
        }
        this._collection.push(...items);
        await this.save();
    }
}

class StoredDict extends StoredCollection {
    get(key) {
        return this._collection[key];
    }

    async set(key, value) {
        this._collection[key] = value;
        await this.save();
    }

    async delete(key) {
        delete this._collection[key];
        await this.save();
    }
}

class StoredSet extends StoredCollection {
    has(item) {
        return this._collection.has(item);
    }

    async add(item) {
        this._collection.add(item);
        await this.save();
    }

    async delete(item) {
        this._collection.delete(item);
        await this.save();
    }

    get storedObject() {
        return Array.from(this._collection);
    }

    async getFromStorage(defaultValue) {
        let obj = await super.getFromStorage(defaultValue);
        if (Array.isArray(obj)) {
            return new Set(obj);
        }
        return obj;
    }
}

export {StoredCollection, StoredArray, StoredDict, StoredSet, STORAGE_TYPES};