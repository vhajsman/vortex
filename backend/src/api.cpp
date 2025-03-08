#include "vortex.h"
#include <iostream>

/**
 * @brief Array of installed API functions
 * 
 */
std::vector <Vortex::api_function_t> functions;

std::string Vortex::api_call_serialize(Vortex::api_call_t call) {
    std::ostringstream oss;
    oss << "/api/" << call.function << "?";

    for(size_t i = 0; i < call.args.size(); ++i) {
        const auto &arg = call.args[i];
        oss << arg.identifier << "=" << arg.value;

        if(i < call.args.size() - 1)
            oss << ";";
    }

    // Termination sequence (double ';')
    oss << ";";
    
    return oss.str();
}

Vortex::api_call_t Vortex::api_call_deserialize(const std::string &input) {
    Vortex::api_call_t apicall;
    std::string args_part;

    size_t function_end = input.find("?");
    if (function_end == std::string::npos)
        return apicall;

    apicall.function = input.substr(0, function_end);

    size_t argc_start = function_end + 1;
    size_t argc_end = input.find("?", argc_start);

    if (argc_end == std::string::npos)
        return apicall;

    std::string argc_str = input.substr(argc_start, argc_end - argc_start);
    apicall.argc = std::stoi(argc_str);

    args_part = input.substr(argc_end + 1);
    if (args_part.empty())
        return apicall;

    std::istringstream args_stream(args_part);
    std::string arg;

    while (std::getline(args_stream, arg, ';')) {
        if (arg.empty()) 
            continue;

        size_t equal_pos = arg.find('=');
        if (equal_pos != std::string::npos) {
            Vortex::api_callArgument apiarg;

            apiarg.identifier = arg.substr(0, equal_pos);
            apiarg.value = arg.substr(equal_pos + 1);
            
            apicall.args.push_back(apiarg);
        }
    }

    return apicall;
}

void Vortex::api_registerFunction(const std::string &identifier, Vortex::api_functioncallback callback) {
    functions.push_back({
        identifier, 
        callback
    });
}

std::string Vortex::api_handler(const std::string &identifier, const std::vector<Vortex::api_callArgument> &args) {
    for(const auto& func: functions) {
        if(func.identifier == identifier) {
            std::cout << "Running API function: " << identifier << std::endl;
            return func.callback(args);
        }
    }

    std::cout << "Could not handle API call: " << identifier << " not found." << std::endl;
    return "error:function-not-found";
}