#pragma once

#include <vector>
#include <string>
#include <unordered_map>

namespace co
{

class HttpResponse
{
public:
    HttpResponse(const std::vector<char>& data);

    std::string getHeader(const std::string& key) const;
    int getStatus() const;
protected:
    void parseHeader(std::string line);

    int status{};
    std::unordered_map<std::string, std::string> headers{};
    std::string body{};
};

class UrlEncodedBody
{
public:
    void add(const std::string& key, const std::string value);
    operator std::string() const;
protected:
    std::vector<std::pair<std::string, std::string>> pairs{};
};

class HttpRequest
{
public:
    HttpRequest(const std::string& method, const std::string& host, int port, const std::string& address, UrlEncodedBody query);

    void addHeader(const std::string& key, const std::string& value);
    void setBody(const std::string& body);

    const std::vector<char>& serialize();

    const std::string method;
    const std::string host;
    const int port;
    const std::string address;
protected:
    std::vector<std::pair<std::string, std::string>> headers{};
    std::string body{};
};

class NonBlockingHttpRequest
{
public:
    NonBlockingHttpRequest(const HttpRequest& request);

    void send();
    bool update();

    HttpResponse getResponse();
protected:
    int socket{};
    std::vector<char> request{};
    std::vector<char> response{};
};

}