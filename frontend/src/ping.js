import { Vortex_Api_Call, vortex_apicall } from "./apicall.js";

export async function vrotex_ping() {
    const time_start = performance.now();

    try {
        const response = await vortex_apicall(new Vortex_Api_Call("echo"));
        if(response !== "echo")
            return -2;

    } catch(e) {
        console.error("Could not ping Vortex server");
        return -1;
    }

    const time_end = performance.now();
    return time_end - time_start;
}