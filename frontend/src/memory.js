/**
 * is value an object?
 * @param {object} value 
 * @returns 
 */
export function vortex_isObject(value) {
    return typeof value === "object";
}

/**
 * Marks variable/object as unused for garbage collector
 * @param {*} reference 
 * @param {*} w_no_objref 
 * @param {*} w_no_unsafe 
 */
export function vortex_free(reference, w_no_objref = false, w_no_unsafe = false) {
    if(!w_no_unsafe) {
        console.warn("Using vortex_free is considered unsafe. Use only when you must to [ w_no_unsafe to ignore ]");
    }

    try {
        if(vortex_isObject(reference)) {
            if(!w_no_objref)
                console.warn(`Setting an object as unused for garbage collector [ w_no_object to ignore ]`);

            eval(`delete ${reference}`)
        }

        eval(`${reference} = null`);
    } catch(e) {
        throw e;
    }
}

/**
 * Calculates size of an object based on contents
 * @param {*} object 
 * @param {*} utf_size 
 * @param {*} e_no_function 
 * @param {*} w_no_null 
 * @returns 
 */
export function vortex_size_object(object, utf_size = 16, e_no_function = false, w_no_null = false) {
    let bbytes = 0;

    if (Array.isArray(object)) {
        for (let i = 0; i < object.length; i++) {
            bbytes += vortex_size(object[i], utf_size, e_no_function, w_no_null);
        }
        return bbytes;
    }

    for (let key in object) {
        if (Object.prototype.hasOwnProperty.call(object, key)) {
            bbytes += utf_size / 8;
            bbytes += vortex_size(object[key], utf_size, e_no_function, w_no_null);
        }
    }

    return bbytes;
}

/**
 * Calculates size of a variable/object based on type(+length)/contents
 * @param {*} reference 
 * @param {*} utf_size 
 * @param {*} e_no_function 
 * @param {*} w_no_null 
 * @returns 
 */
export function vortex_size(reference, utf_size = 16, e_no_function = false, w_no_null = false) {
    let bytes = 0;

    if(reference == null && !w_no_null) {
        console.warn("Calculated a size of a null variable");
        return 0;
    }

    switch(typeof reference) {
        case "number":  bytes += 8;                                             break;
        case "string":  bytes += reference.length * ((utf_size / 8 + 1) * 2);   break; // +1 for termination mark
        case "boolean": bytes += 4;                                             break;

        case "object":  
            bytes += vortex_size_object(reference, utf_size, e_no_function);
            break;

        case "function":
            if(!e_no_function) {
                throw new Error("Unable to get size of a function [ e_no_function to get estimate ]");
                return;
            }

            bytes += 8;
    }

    return bytes;
}

export class Vortex_Cache {
    cache;
    queue;
    size;

    constructor(size = 0) {
        if(size === 0)
            console.warn("No size set for cache memory, setting infinity. This is not always a good idea because of potentional memory leaks.");

        this.cache = new Map();
        this.queue = [];
        this.size = size;
    }

    fifo_discard() {
        if(this.size > 0 && this.queue.length >= this.size) {
            const oldest = this.queue.shift();
            this.cache.delete(oldest);
        }
    }

    get(k) {
        return this.cache.get(k) || null;
    }

    set(k, v) {
        if(this.cache.has(k)) {
            this.cache.set(k, v);
            return;
        }

        this.fifo_discard();

        this.cache.set(k, v);
        this.queue.push(k);
    }

    discard(k) {
        const kv = this.get(k);

        this.cache.delete(k);
        this.queue.filter(kk => kk !== k);

        return kv;
    }

    has(k) {
        return this.cache.has(k);
    }

    clear() {
        this.cache.clear();
        this.queue = [];
    }

    getOccupied() {
        return this.cache.size;
    }

    getFree() {
        return this.size != 0 ? this.size - this.getOccupied() : 0;
    }

    indexOf(k) {
        return this.queue.indexOf(k);
    }

    swap(idx_a, idx_b) {
        idx_a = typeof(idx_a) == "string" ? this.indexOf(idx_a) : idx_a;
        idx_b = typeof(idx_b) == "string" ? this.indexOf(idx_b) : idx_b;

        if(idx_a < 0 || idx_b < 0) {
            console.warn("One or both keys missing.");
            return -1;
        }

        [this.queue[idx_a], this.queue[idx_b]] = [this.queue[idx_b], this.queue[idx_a]]
    }

    extend(k) {
        if(this.size > 0 && this.queue.length >= this.size)
            this.fifo_discard();

        if(!this.queue.includes(k))
            return -1;

        this.swap(k, this.queue.length - 1)
    }

    resize(newsz) {
        this.size = newsz;
        this.fifo_discard();
    }
};
