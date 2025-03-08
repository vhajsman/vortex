/**
 * apicall.js
 * -----------------------------------------------------------
 * responsible for making and handling API calls with server
 */

export class Vortex_Api_CallArgument {
    constructor(id, value) {
        this.id = id;
        this.value = value;
    }
};

export class Vortex_Api_Call {
    constructor(function_name) {
        this.function_name = function_name;
        this.arguments_list = [];
    }

    appendArgument(argument) {
        this.arguments_list.push(argument);
    }

    setArgument(id, value) {
        value = String(value);

        const existing = this.arguments_list.find(arg => arg.id === id);
        if(existing) {
            existing.value = value;
            return;
        }

        const arg_new = new Vortex_Api_CallArgument(id, value);
        this.appendArgument(arg_new);
    }

    serialize() {
        const arg_count = this.arguments_list.length;
        let serialized = `/api/${this.function_name}?${arg_count}?`;

        serialized += this.arguments_list
            .map(arg => `${encodeURIComponent(arg.id)}=${encodeURIComponent(arg.value)}`)
            .join(";");

        serialized += ";;";
        return serialized;
    }
};

export async function vortex_apicall(call) {
    const serial = call.serialize();
    console.log("serialized api call: ", serial);

    try {
        const response = await fetch(serial, {method: "GET"});
        if(!response.ok)
            throw new Error(`API call HTTP error: ${response.status}`);

        const feedback = await response.text();
        return feedback;
    } catch(e) {
        console.error("Error sending API call");
        throw e;
    }
}