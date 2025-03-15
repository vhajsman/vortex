import { vortex_desktop, vortex_taskbar } from "./desktop.js";
import { vortex_logon } from "./logon.js";
import { vortex_scheduler } from "./multitasking/scheduler.js";
import { vrotex_ping } from "./ping.js"
import { vortex_wnx } from "./wnx.js";
import { VThread } from "./multitasking/vthread.js";

console.log(`Vortex server ping: ${await vrotex_ping()} ms`);

vortex_desktop.desktopElement.style.display = "none";

const urlPar = new URLSearchParams(window.location.search);
if(urlPar.has("f-dbg-nologin")) {
    console.log("skipping login because of debug flag");
    document.getElementById("vortex-loging-login-incorrect").style.display = "none";
    document.getElementById("vortex-activity-login").style.display = "none";

    vortex_desktop.main();
    vortex_taskbar.main();
} else {
    document.getElementById("vortex-loging-login-incorrect").style.display = "none";
    
    document.getElementById("vortex-login-loginbtn").addEventListener("click", async () => {
        const form = document.getElementById("vortex-form-login-login");
        const username = form["vortex-login-login-username"].value;
        const password = form["vortex-login-login-password"].value;
    
        try {
            const r = await vortex_logon.login(username, password);
            if (r) {
                document.getElementById("vortex-loging-login-incorrect").style.display = "none";
                document.getElementById("vortex-activity-login").style.display = "none";
    
                vortex_desktop.main();
                vortex_taskbar.main();
            } else {
                document.getElementById("vortex-loging-login-incorrect").style.display = "block";
            }
        } catch (e) {
            console.error("Login error:", e);
            alert("Login error: " + e.message);
        }
    });
}

const w = vortex_wnx.window_create("MyWindow", 800, 600);
w.create(0, 0);
const ww = vortex_wnx.window_create("MyWindow", 800, 600);
ww.create(20, 20);


await vortex_scheduler.init();

/*
const exampleTask1 = async () => {
    return new Promise(resolve => {
        setTimeout(() => resolve("Result 1"), 1000);
    });
};

const exampleTask2 = async () => {
    return new Promise(resolve => {
        setTimeout(() => resolve("Result 2"), 500);
    });
};

const exampleTask3 = async () => {
    return new Promise(resolve => {
        setTimeout(() => resolve("Result 3"), 1500);
    });
};

const thread1 = new VThread(exampleTask1, "Task 1", 1);
const thread2 = new VThread(exampleTask2, "Task 2", 2);
const thread3 = new VThread(exampleTask3, "Task 3", 3);

vortex_scheduler.addThread(thread1);
vortex_scheduler.addThread(thread2);
vortex_scheduler.addThread(thread3);
*/

await vortex_scheduler.run();