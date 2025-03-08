#ifndef __VORTEX_H
#define __VORTEX_H

#include <boost/beast/core.hpp>
#include <boost/beast/http.hpp>
#include <boost/asio.hpp>
#include <boost/program_options.hpp>
#include <boost/filesystem.hpp>
#include <boost/json.hpp>
#include <vector>
#include <string>
#include <functional>

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

    /**
     * @brief API Call argument header
     * 
     */
    struct api_callArgument {
        std::string identifier;
        std::string value;
    };

    /**
     * @brief API Call header
     * 
     */
    typedef struct api_call {
        /**
         * @brief Function identifier
         */
        std::string function;

        /**
         * @brief Array of API Call argument headers
         */
        std::vector<Vortex::api_callArgument> args;

        // Arguments count, AKA length of 'args'
        int argc;
    } api_call_t;

    using api_functioncallback = std::function <std::string(const std::vector <Vortex::api_callArgument>&)>;

    typedef struct api_function {
        std::string identifier;
        Vortex::api_functioncallback callback;
    } api_function_t;

    /**
     * @brief Serializes an API call into a string format
     * 
     * Converts a Vortex::api_call_t structure into a properly formatted API request string.
     * The format follows: /api/function_name?arg1=value1;arg2=value2;;
     * 
     * @param call The API call structure containing function name and arguments.
     * @return A serialized string representation of the API call.
    */
    std::string api_call_serialize(Vortex::api_call_t call);

    /**
     * @brief Deserializes a string into an API call structure
     * 
     * Parses an API request string and converts it into a Vortex::api_call_t structure.
     * Extracts the function name and its arguments from the request string.
     * 
     * @param input The API request string to be deserialized.
     * @return A populated Vortex::api_call_t structure with extracted values.
    */
    Vortex::api_call_t api_call_deserialize(const std::string& input);

    /**
     * @brief Install API function callback
     * 
     * @param identifier 
     * @param callback 
     */
    void api_registerFunction(const std::string& identifier, Vortex::api_functioncallback callback);

    /**
     * @brief Handles an API call by executing the corresponding registered function
     * 
     * Searches for the API function by its identifier and executes it with the provided arguments.
     * If the function is found, it is executed and its return value is provided.
     * If not found, an error message is returned.
     * 
     * @param identifier The API function identifier to be executed.
     * @param args List of arguments for the API function.
     * @return The result of the API function execution or an error message if not found.
    */
    std::string api_handler(const std::string& identifier, const std::vector<Vortex::api_callArgument>& args);

    std::string ping_response(const std::vector<Vortex::api_callArgument>& args);
};

#endif