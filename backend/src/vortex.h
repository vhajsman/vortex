#ifndef __VORTEX_H
#define __VORTEX_H

#include <boost/beast/core.hpp>
#include <boost/beast/http.hpp>
#include <boost/asio.hpp>
#include <boost/program_options.hpp>
#include <boost/filesystem.hpp>
#include <boost/json.hpp>

namespace json = boost::json;
namespace po = boost::program_options;
namespace beast = boost::beast; 
namespace http = beast::http;       
namespace net = boost::asio;         
using tcp = boost::asio::ip::tcp;  

std::string getFileType(const std::string& path);

namespace Vortex {
    class Server {
        private:
        net::io_context io_context;

        public:
        Server();
        void run(int port);
        void listen(tcp::acceptor* acceptor);
        void handleReq(http::request<http::string_body> req, tcp::socket& sock);
    };
    void server_run(int port);
};

#endif