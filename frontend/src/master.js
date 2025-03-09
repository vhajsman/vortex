import { vortex_desktop, vortex_taskbar } from "./desktop.js";
import { vortex_logon } from "./logon.js";
import { vrotex_ping } from "./ping.js"

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
