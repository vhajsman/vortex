#include "vortex.h"

std::map<std::string, std::string> mime_types = {
    {".html", "text/html"},
    {".htm", "text/html"},
    {".css", "text/css"},
    {".js", "application/javascript"},
    {".json", "application/json"},
    {".jpg", "image/jpeg"},
    {".jpeg", "image/jpeg"},
    {".png", "image/png"},
    {".gif", "image/gif"},
    {".txt", "text/plain"},
};

std::string getFileType(const std::string& path) {
    auto extension = boost::filesystem::path(path).extension().string();
    
    auto it = mime_types.find(extension);
    if (it != mime_types.end())
        return it->second;
    
    return "application/octet-stream";
}