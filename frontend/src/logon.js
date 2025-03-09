/**
 * logon.js
 * -----------------------------------------------------------
 * responsible for performing user management related operations
 * from the frontend (client) - such as logging in
 */

import { Vortex_Api_Call, Vortex_Api_CallArgument, vortex_apicall } from "./apicall.js";

export const vortex_logon = {
    loggedIn: false,
    username: "",
    admin: "",

    async login(username, key) {
        let call = new Vortex_Api_Call("auth-login");
        call.setArgument("username", username);
        call.setArgument("password", key);

        let response;

        try {
            response = await vortex_apicall(call);
        } catch(e) {
            console.error("could not login because of communication error");
            return false;
        }

        if(response === "true") {
            this.username = username;
            this.loggedIn = true;

            this.updateAdminStatus();

            return true;
        }

        this.loggedIn = false;
        return false;
    },

    async updateAdminStatus() {
        let call = new Vortex_Api_Call("auth-amiadmin");
        let response;

        try {
            response = await vortex_apicall(call);
        } catch(e) {
            console.error("could not refresh because of communication error");
            return false;
        }

        this.admin = response === "true";
        return this.admin;
    },

    async updateUserName() {
        let call = new Vortex_Api_Call("auth-whoami");
        let response;

        try {
            response = await vortex_apicall(call);
        } catch(e) {
            console.error("could not refresh because of communication error");
            return false;
        }

        this.username = response;

        if(response === "null") {
            this.admin = false;
            this.loggedIn = false;

            return "null";
        }

        return response;
    },

    async logout() {
        let call = new Vortex_Api_Call("auth-logout");
        let response;

        try {
            response = await vortex_apicall(call);
        } catch(e) {
            alert("Vortex environment is ready to shut down now, but it has failed to inform pseudokernel - please contact your administrator, otherwise you'll put yourself on a HUGE security risk.");

            console.error("could not logout because of communication error");
            return false;
        }

        return true;
    }
};