#include "OnlineService.hpp"
#include "json.hpp"

namespace co
{

void OnlineService::makeRequest(HttpRequest rq, callback_type callback)
{
    auto p = std::make_pair(NonBlockingHttpRequest{ rq }, callback);
    p.first.send();
    pendingCalls.push_back(std::move(p));
}

void OnlineService::processPendingCalls()
{
    if (pendingCalls.empty())
        return;

    for (auto it = pendingCalls.begin(); it != pendingCalls.end();)
    {
        if ((*it).first.update())
        {
            auto response = (*it).first.getResponse();
            (*it).second(response);
            it = pendingCalls.erase(it);
        }
        else
        {
            ++it;
        }
    }
}

void OnlineService::setHost(std::string host)
{
    auto colon = host.find(':');
    if (colon != std::string::npos)
        host_port = std::stoi(host.substr(colon + 1));
    else
        host_port = 80;
    host_address = host.substr(0, colon);
    // DEBUG
    printf("Host = %s, port = %d\n", host_address.c_str(), host_port);
}

void OnlineService::setErrorHandler(error_handler_type handler)
{
    error_handler = handler;
}

void OnlineService::error(std::string message)
{
    if (error_handler)
        error_handler(message);
}

void OnlineService::login(std::string key, std::function<void(IdentifiedUser)> callback)
{
    UrlEncodedBody body{};
    body.add("key", key);
    HttpRequest request("GET", host_address, host_port, "/user/me", body);
    api_key = key;
    makeRequest(request, [this, callback](HttpResponse& response) {
        if (response.getStatus() == 200)
        {
            auto j = nlohmann::json::parse(response.getBody());
            IdentifiedUser user{};
            user.username = j["username"];
            callback(user);
        }
        else
        {
            error("Could not login: " + std::to_string(response.getStatus()));
        }
    });
}

}