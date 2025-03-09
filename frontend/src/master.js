import { vortex_logon } from "./logon.js";
import { vrotex_ping } from "./ping.js"

console.log(`Vortex server ping: ${await vrotex_ping()} ms`);

document.getElementById("vortex-login-loginbtn").addEventListener("click", async () => {
    const form = document.getElementById("vortex-form-login-login");
    const username = form["vortex-login-login-username"].value;
    const password = form["vortex-login-login-password"].value;

    try {
        const r = await vortex_logon.login(username, password);
        if (r) {
            alert("Logged in");
        } else {
            alert("Login failed: Invalid credentials");
        }
    } catch (e) {
        console.error("Login error:", e);
        alert("Login error: " + e.message);
    }
});