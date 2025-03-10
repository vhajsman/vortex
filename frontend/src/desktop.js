import { vrotex_ping } from "./ping.js";
import { vortex_wnx } from "./wnx.js";

export const vortex_desktop = {
    desktopElement: document.getElementById("vortex-desktop"),

    main() {
        this.desktopElement.style.display = "block";
    }
};

export const vortex_taskbar = {
    taskbarElement: document.getElementById("vortex-taskbar"),

    updateClock() {
        const now = new Date();
        document.getElementById("vortex-taskbar-clock").textContent = now.toLocaleTimeString();
    },

    async updatePing() {
        const ping = await vrotex_ping();

        if(ping <= 0) {
            document.getElementById("vortex-taskbar-ping").textContent = "N.C.";
            return;
        }

        document.getElementById("vortex-taskbar-ping").textContent = Math.floor(ping) + " ms";
    },

    activity: {
        setActivity(activity) {
            document.getElementById("vortex-taskbar-activity").textContent = activity;
        },

        noActivity() {
            this.setActivity("Nothing opened, nothing to see here you dumb ass nigga")
        }
    },

    main() {
        this.taskbarElement.style.display = "flex";
        this.taskbarElement.style.zIndex = vortex_wnx.maxSuperLayerCount + vortex_wnx.maxWindowLayerCount;

        setInterval(this.updateClock, 1000);
        this.updateClock();

        setInterval(this.updatePing, 20000);
        this.updatePing();

        this.activity.noActivity();
    }
};