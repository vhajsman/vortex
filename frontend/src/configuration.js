import { vortex_loadfile } from "./apicall.js";
import { Vortex_Cache } from "./memory.js";

function ensureSlash(path) {
    return path.endsWith("/") ? path : path + "/";
}

async function loadJson(group) {
    const filenames = Vortex_ConfigManager.getPotentialFilenames(group);
    
    for (let filename of filenames) {
        try {
            const contents = await vortex_loadfile(filename, true);

            if (contents !== null)
                return JSON.parse(contents);
        } catch (e) {
            console.error(`Chyba při načítání souboru ${filename}:`, e);
        }
    }

    return null;
}

export const Vortex_ConfigManager = {
    paths_default: [],
    paths_explicit: [],

    filename_extensions: [".json"],

    /**
     * Enable URL parameters
     * 0: Disable
     * 1: Enable
     * 2: Enable, with higher priority than files
     */
    enableUrlParams: 2,

    prefix_url_enable: ["f-"],
    group_url: ["vortex"],

    caches: new Map(),

    getUrlParameters: function() {
        const params = new URLSearchParams(window.location.search);
        let result = {};

        const prefix = this.prefix_url_enable[0];
    
        params.forEach((value, key) => {
            if(value.startsWith(prefix))
                result[key.replaceAll(prefix, "")] = value;
        });
    
        return result;
    },

    getPotentialFilenames: function(group) {
        let filenames = [];

        for(let path of this.paths_explicit) {
            path = ensureSlash(path);

            for(let extension of this.filename_extensions)
                filenames.push(`${path}${group}${extension}`);
        }

        for(let path of this.paths_default) {
            path = ensureSlash(path);

            for(let extension of this.filename_extensions)
                filenames.push(`${path}${group}${extension}`);
        }

        return filenames;
    },

    loadConfig: async function(group, cache_write = true) {
        let object = await loadJson(group);

        if(object === null) {
            console.warn("Configuration load failed.");
            object = {}; // ensure object
        }

        const updatedObject = { ...object };
        const en = this.enableUrlParams;

        if(group === this.group_url[0]) {
            const n = this.getUrlParameters();

            if(en != 0) {
                for(let i = 0; i < Object.keys(n).length; i++) {
                    let k = Object.keys(n)[i];

                    if(en != 2 && k in updatedObject)
                        continue;

                    updatedObject[k] = n[k];
                }
            }
        }

        if(cache_write) {
            if(!this.caches.has(group))
                this.caches.set(group, new Vortex_Cache(0));

            const cache = this.caches.get(group);
            cache.resize(Object.keys(updatedObject).length + 8);
            cache.set(group, object);
        }

        return updatedObject;
    },

    isLoaded: function(group) {
        return this.caches.has(group);
    },

    async getKey(group, key) {
    const g = this.isLoaded(group) ? this.caches.get(group) : await this.loadConfig(group);
    
    if (g && typeof g.get === 'function') {
        const value = await g.get(key);
        return value;
    } else {
        console.warn('group is not a valid object with a get method. Probably failed to load somehow.');
    }
}
    
};