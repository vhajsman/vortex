#include "vortex.h"
#include <boost/asio/io_context.hpp>
#include <boost/asio/serial_port.hpp>
#include <iostream>
#include <boost/filesystem.hpp>
#include <fstream>
#include <string>
#include <sstream>

int _port;
std::string storage_path = "userland";

void Vortex::server_run(int port) {
    _port = port;
    Vortex::Server server;

    server.run(_port);
}

Vortex::Server::Server() : io_context{1} {
    
}

void Vortex::Server::run(int port) {
    _port = port;

    tcp::acceptor acceptor{
        this->io_context,
        {
            tcp::v4(),
            (boost::asio::ip::port_type) port
        }
    };

    std::cout << "Listening on port: " << std::to_string(port) << std::endl;
    std::cout << "Desktop: http://localhost:" << std::to_string(port) << "/index.html" << std::endl;

    this->listen(&acceptor);
}

void Vortex::Server::listen(tcp::acceptor* acceptor) {
    while(true) {
        tcp::socket sock{this->io_context};
        acceptor->accept(sock);

        beast::flat_buffer buffer;
        http::request<http::string_body> request;

        try {
            http::read(sock, buffer, request);
            handleReq(request, sock);
        } catch(const std::exception& e) {
            std::cerr << "Failed to process HTTP request: " << e.what() << std::endl;
        }
    }
}

void Vortex::Server::handleReq(http::request<http::string_body> req, tcp::socket& sock) {
    try {
        http::response<http::string_body> response {
            http::status::ok,
            req.version()
        };

        response.set(http::field::server, "Boost.Beast");

        std::string filename;
        std::string filepath;

        // Filesystem API
        if(req.target().starts_with("/api/files")) {
            filename = std::string(req.target().substr(11));
            filepath = storage_path + "/" + filename;
        } else if(req.target().starts_with("/api/")) {
            const std::string function = req.target().substr(5);
            Vortex::api_call_t call = Vortex::api_call_deserialize(function);

            std::cout << function << std::endl;
            std::string ret = Vortex::api_handler(call.function, call.args);

            std::stringstream buffer;
            buffer << ret;

            response.body() = buffer.str();

            if(buffer.str().at(0) == '{' || buffer.str().at(0) == '[') {
                response.set(http::field::content_type, "application/json");
            } else {
                response.set(http::field::content_type, "text/plain");
            }

            response.prepare_payload();
            http::write(sock, response);

            return;
        } else {
            std::string target = std::string(req.target());
            
            size_t pos = target.find('?');
            if (pos != std::string::npos)
                target = target.substr(0, pos);

            filename = target.substr(1);
            if(filename.find("./") == 0)
                filename.erase(0, 2);

            filepath = "frontend/" + filename;
        }

        boost::filesystem::path filepath_final(filepath);

        std::cout << "HTTP GET: " << filepath << std::endl;
        if(boost::filesystem::exists(filepath_final)) {
            if(boost::filesystem::is_directory(filepath_final)) {
                json::array contents;
                
                for(const auto& entry: boost::filesystem::directory_iterator(filepath_final)) {
                    json::object item;

                    item["filename"] = entry.path().filename().string();
                    item["filetype"] = boost::filesystem::is_directory(entry) ? "DIRECTORY" : "FILE";

                    contents.emplace_back(item);
                }

                response.set("X-Resource-Type", "directory");
                response.result(http::status::ok);

                response.set(http::field::content_type, "application/json");
                response.body() = json::serialize(contents);
            } else if(boost::filesystem::is_regular_file(filepath_final)) {
                std::stringstream buffer;
                std::ifstream file(filepath.c_str());
                std::string mime = getFileType(filepath.c_str());

                buffer << file.rdbuf();

                response.set("X-Resource-Type", "file");
                response.result(http::status::ok);

                response.set(http::field::content_type, mime);
                response.body() = buffer.str();
            }
        } else {
            response.result(http::status::not_found);
            response.body() = "file not found";
        }

        response.prepare_payload();
        http::write(sock, response);
    } catch(const std::exception& e) {
        std::cerr << "failed to handle HTTP request" << e.what() << std::endl;

        http::response<http::string_body> response {
            http::status::internal_server_error,
            req.version()
        };

        response.body() = "internal server error";
        response.prepare_payload();

        http::write(sock, response);
    }
}