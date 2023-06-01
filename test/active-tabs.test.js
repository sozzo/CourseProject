import { chrome } from "jest-chrome";

jest.mock("webextension-polyfill", () => require("jest-chrome").chrome);

import activeTabs from "../src/storage/active-tabs";

describe('activeTabs', () => {
  describe('updateLastVisited', () => {
    beforeEach(() => {
      // Clear the tabs collection before each test
      activeTabs._collection = {};
    });

    it('should update last visited datetime for a tab', async () => {
      const tab = { url: 'https://example.com' };
      await activeTabs.updateLastVisited(tab);

      expect(activeTabs.tabs['https://example.com']).toEqual({
        lastVisited: expect.any(Number),
        markedForCleanup: null,
      });
    });

    it('should not update last visited datetime if tab is incognito', async () => {
      const tab = { url: 'https://example.com', incognito: true };
      await activeTabs.updateLastVisited(tab);

      expect(activeTabs.tabs['https://example.com']).toBeUndefined();
    });

    it('should not update last visited datetime if tab url is empty', async () => {
      const tab = { url: '' };
      await activeTabs.updateLastVisited(tab);

      expect(activeTabs.tabs['']).toBeUndefined();
    });

    it('should rewrite last visited datetime if rewrite option is true', async () => {
      const tab = { url: 'https://example.com' };
      await activeTabs.set('https://example.com', { lastVisited: 12345 });
      await activeTabs.updateLastVisited(tab, true);

      expect(activeTabs.tabs['https://example.com']).toEqual({
        lastVisited: expect.any(Number),
        markedForCleanup: null,
      });
      expect(activeTabs.tabs['https://example.com'].lastVisited).not.toBe(12345);
    });

    it('should not rewrite last visited datetime if rewrite option is false', async () => {
      const tab = { url: 'https://example.com' };
      const initial = { lastVisited: 12345, markedForCleanup: null };
      await activeTabs.set('https://example.com', initial);
      await activeTabs.updateLastVisited(tab, false);

      expect(activeTabs.tabs['https://example.com']).toEqual(initial);
    });
  });
});
