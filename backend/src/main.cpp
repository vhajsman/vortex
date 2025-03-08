#include "vortex.h"
#include <iostream>

std::string path_frontend;
std::string path_userland;

int main(int argc, char** argv) {
    po::variables_map vm;
    int port;

    po::options_description desc("Available options");
    desc.add_options()
        ("help,h", "shows this menu")
        ("frontend,f", po::value <std::string> (&path_frontend)->required(), "path to frontend directory")
        ("userland,u", po::value <std::string> (&path_userland)->required(), "path to userland directory")
        ("port,p", po::value <int> (&port)->default_value(5000), "server port (default: 5000)")
    ;
    
    try {
        po::store(po::parse_command_line(argc, argv, desc), vm);

        if(vm.count("help")) {
            std::cout << desc << std::endl;
            return 0;
        }

        po::notify(vm);
    } catch(const po::error& error) {
        std::cerr << "CLI parse error: " << error.what() << std::endl;
        std::cerr << desc << std::endl;

        return 1;
    }

    std::cout << "Frontend path:    " << path_frontend << std::endl;
    std::cout << "Userland path:    " << path_userland << std::endl;
    std::cout << "HTTP server port: " << port << std::endl;
    std::cout << "Vertex 1.0 (backend)" << std::endl;  

    Vortex::api_registerFunction("echo", Vortex::ping_response);
    Vortex::server_run(port);
}