import {chrome} from "jest-chrome";
import {StoredCollection, StoredDict, StoredArray, StoredSet} from "../src/storage/stored-collections";

jest.mock('webextension-polyfill', () => require('jest-chrome').chrome)

describe('StoredCollection', () => {
    let storageKey = 'testKey';
    let defaultValue = [1, 2, 3];
    let storageType = 'local';
    let storage;
    let storedCollection;

    beforeEach(() => {
        storage = chrome.storage[storageType];
        storage.get = jest.fn();
        storage.set = jest.fn();
        storedCollection = new StoredCollection(storageKey, defaultValue, storageType);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('init', () => {
        it('should set _collection to the value returned from getFromStorage', async () => {
            storage.get.mockResolvedValueOnce({[storageKey]: [4, 5, 6]});
            await storedCollection.init(defaultValue);
            expect(storedCollection._collection).toEqual([4, 5, 6]);
        });

        it('should set _collection to defaultValue if getFromStorage returns undefined', async () => {
            storage.get.mockResolvedValueOnce(undefined);
            await storedCollection.init(defaultValue);
            expect(storedCollection._collection).toEqual(defaultValue);
        });

        it('should call save after setting _collection', async () => {
            storage.get.mockResolvedValueOnce({[storageKey]: [4, 5, 6]});
            storedCollection.save = jest.fn();
            await storedCollection.init(defaultValue);
            expect(storedCollection.save).toHaveBeenCalled();
        });
    });

    describe('getFromStorage', () => {
        it('should return the value associated with storageKey from chrome storage', async () => {
            storage.get.mockResolvedValueOnce({[storageKey]: [4, 5, 6]});
            expect(await storedCollection.getFromStorage(defaultValue)).toEqual([4, 5, 6]);
            expect(storage.get).toHaveBeenCalledWith(storageKey);
        });

        it('should return defaultValue if chrome storage returns undefined', async () => {
            storage.get.mockResolvedValueOnce(undefined);
            expect(await storedCollection.getFromStorage(defaultValue)).toEqual(defaultValue);
        });
    });

    describe('save', () => {
        it('should set the value of storageKey to _collection in chrome storage', async () => {
            storedCollection._collection = [4, 5, 6];
            await storedCollection.save();
            expect(storage.set).toHaveBeenCalledWith({[storageKey]: [4, 5, 6]});
        });
    });
});


describe('StoredArray', () => {
    let storageKey = 'testKey';
    let defaultValue = [1, 2, 3];
    let storageType = 'local';
    let storage;
    let storedArray;

    beforeEach(() => {
        storage = chrome.storage[storageType];
        storage.get = jest.fn();
        storage.set = jest.fn();
        storedArray = new StoredArray(storageKey, defaultValue, storageType);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('push', () => {
        it('should push items to _collection and call save', async () => {
            storedArray.save = jest.fn();
            await storedArray.push(4);
            expect(storedArray._collection).toEqual([1, 2, 3, 4]);
            expect(storedArray.save).toHaveBeenCalled();
        });
    });
});

describe('StoredDict', () => {
    let storageKey = 'testKey';
    let defaultValue = {a: 1, b: 2};
    let storageType = 'local';
    let storage;
    let storedDict;

    beforeEach(() => {
        storage = chrome.storage[storageType];
        storage.get = jest.fn();
        storage.set = jest.fn();
        storedDict = new StoredDict(storageKey, defaultValue, storageType);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('get', () => {
        it('should return the value associated with the key in _collection', () => {
            expect(storedDict.get('a')).toEqual(1);
            expect(storedDict.get('b')).toEqual(2);
        });
    });

    describe('set', () => {
        it('should set the value for the key in _collection and call save', async () => {
            storedDict.save = jest.fn();
            await storedDict.set('a', 3);
            expect(storedDict._collection).toEqual({a: 3, b: 2});
            expect(storedDict.save).toHaveBeenCalled();
        });
    });
});


describe('StoredSet', () => {
    let storageKey = 'testKey';
    let defaultValue = new Set([1, 2, 3]);
    let storageType = 'local';
    let storage;
    let storedSet;

    beforeEach(() => {
        storage = chrome.storage[storageType];
        storage.get = jest.fn();
        storage.set = jest.fn();
        storedSet = new StoredSet(storageKey, defaultValue, storageType);
    });

    describe('getFromStorage', () => {
        it('should return the value associated with storageKey from chrome storage and cast Array to Set', async () => {
            storage.get.mockResolvedValueOnce({[storageKey]: [4, 5, 6]});
            expect(await storedSet.getFromStorage(defaultValue)).toEqual(new Set([4, 5, 6]));
            expect(storage.get).toHaveBeenCalledWith(storageKey);
        });

        it('should return defaultValue if chrome storage returns undefined', async () => {
            storage.get.mockResolvedValueOnce(undefined);
            expect(await storedSet.getFromStorage(defaultValue)).toEqual(defaultValue);
        });
    });
})