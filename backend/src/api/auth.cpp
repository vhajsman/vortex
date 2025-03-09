#include "../vortex.h"
#include <fstream>
#include <iostream>

std::string currentUser;
bool isAdmin = false;
bool isLoggedIn = false;

bool Vortex::auth_checkCredentials(const std::string &username, const std::string &password) {
    std::string path_config = "/etc/userconfig.json";
    std::ifstream file(path_config);

    if(!file) {
        std::cerr << "could not open " << path_config << std::endl;
        return false;
    }

    json::value _json;
    file >> _json;
    auto users = _json.as_object();

    if(users.contains(username)) {
        auto user = users[username].as_object();
        return user["auth_key"].as_string() == password;
    }

    return false;
}

bool Vortex::auth_isAdmin(const std::string& username) {
    std::string path_config = "/etc/userconfig.json";
    std::ifstream file(path_config);

    if(!file) {
        std::cerr << "could not open " << path_config << std::endl;
        return false;
    }

    json::value _json;
    file >> _json;
    auto users = _json.as_object();

    if(users.contains(username)) {
        auto user = users[username].as_object();
        return user["auth_admin"].as_bool();
    }

    return false;
}

std::string Vortex::auth_api_login(const std::vector<Vortex::api_callArgument> &args) {
    std::string username, password;

    for (const auto& arg : args) {
        if (arg.identifier == "username") username = arg.value;
        if (arg.identifier == "password") password = arg.value;
    }

    bool x = Vortex::auth_checkCredentials(username, password);

    if(x) {
        currentUser = username;
        isLoggedIn = true;

        isAdmin = Vortex::auth_isAdmin(currentUser);
    }

    return x ? "true" : "false";
}

std::string Vortex::auth_api_logout(const std::vector<Vortex::api_callArgument> &args) {
    currentUser = "";
    isLoggedIn = false;
    isAdmin = false;

    return "true";
}

std::string Vortex::auth_api_whoami(const std::vector<Vortex::api_callArgument> &args) {
    return isLoggedIn ? currentUser : "null";
}

std::string Vortex::auth_api_amiadmin(const std::vector<Vortex::api_callArgument> &args) {
    return isLoggedIn && isAdmin ? "true" : "false";
}
