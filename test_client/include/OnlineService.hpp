#pragma once

#include <string>
#include <vector>
#include <functional>
#include <memory>

#include "HttpRequest.hpp"

namespace co
{

struct Role
{
    std::string name{};
    std::string display_name{};
};

struct IdentifiedUser
{
    std::string username{};
    bool has_color;
    int r;
    int g;
    int b;
    std::vector<Role> roles{};
};

struct IdentifiedGroup
{
    std::unordered_map<unsigned, IdentifiedUser> users{};
};

class OnlineService
{
public:
    using error_handler_type = std::function<void(std::string)>;

    void setHost(std::string host);
    void setErrorHandler(error_handler_type handler);

    void login(std::string key, std::function<void(IdentifiedUser)> callback);

    void gameStartup(unsigned steamId);
    void userIdentify(const std::vector<unsigned>& steamIdList, std::function<void(IdentifiedGroup)> callback);
    void userIdentify(unsigned steamId, std::function<void(unsigned, IdentifiedUser)> callback);

    void processPendingCalls();
protected:
    using callback_type = std::function<void(HttpResponse&)>;
    using pair_type = std::pair<NonBlockingHttpRequest, callback_type>;
 
    void makeRequest(HttpRequest rq, callback_type callback);
    void error(std::string message);

    std::string host_address{};
    int host_port{};

    bool loggedIn{ false };
    std::string api_key{};

    std::vector<pair_type> pendingCalls{};
    error_handler_type error_handler{ nullptr };
};

}