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

class RunningApiCall
{
public:
    using callback_type = std::function<void(HttpResponse)>();

    RunningApiCall(HttpRequest request, callback_type callback);
    bool process();
protected:
    bool finished{ false };
    const callback_type callback;
};

class OnlineService
{
public:
    void setHostAddress(const std::string& address);
    void setErrorHandler(std::function<void(std::string)> handler);

    void login(const std::string& key, std::function<void(IdentifiedUser)> callback);

    void gameStartup(unsigned steamId);
    void userIdentify(const std::vector<unsigned>& steamIdList, std::function<void(IdentifiedGroup)> callback);
    void userIdentify(unsigned steamId, std::function<void(unsigned, IdentifiedUser)> callback);

    void processPendingCalls();
protected:
    void makeRequest();

    bool loggedIn{ false };
    std::string apiKey{};

    std::vector<std::unique_ptr<RunningApiCall>> pendingCalls{};
    std::function<void(std::string)> errorHandler{ nullptr };
};

}