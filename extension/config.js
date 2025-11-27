const GITHUB_CONFIG_URL = 'https://raw.githubusercontent.com/glidea/banana-prompt-quicker/main/config.json';
const CONFIG_CACHE_KEY = 'config_cache';
const CONFIG_CACHE_TIMESTAMP_KEY = 'config_cache_time';
const CONFIG_CACHE_DURATION = 2 * 60 * 1000; // 2 min

window.ConfigManager = {
    async get() {
        try {
            // 1. Check cache
            const cache = await chrome.storage.local.get([CONFIG_CACHE_KEY, CONFIG_CACHE_TIMESTAMP_KEY]);
            const cachedPrompts = cache[CONFIG_CACHE_KEY];
            const cacheTime = cache[CONFIG_CACHE_TIMESTAMP_KEY];
            const now = Date.now();
            if (cachedPrompts && cacheTime && (now - cacheTime < CONFIG_CACHE_DURATION)) {
                return cachedPrompts;
            }

            // 2. Fetch from GitHub
            const response = await fetch(GITHUB_CONFIG_URL);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();


            // 3. Update cache
            await chrome.storage.local.set({
                [CONFIG_CACHE_KEY]: data,
                [CONFIG_CACHE_TIMESTAMP_KEY]: now
            });
            return data;

        } catch (error) {
            console.error('Failed to fetch prompts:', error);

            // 4. Fallback to cache if available (even if expired)
            const cache = await chrome.storage.local.get([CONFIG_CACHE_KEY]);
            return cache[CONFIG_CACHE_KEY]
        }
    }
};
