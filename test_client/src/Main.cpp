#include "UrlEncoding.hpp"
#include "HttpRequest.hpp"
#include "OnlineService.hpp"

#include <iostream>
#include <thread>
#include <chrono>

void urlEncodingTest()
{
    std::cout << "URL ENCODING TEST\n";

    std::cout << co::urlEncode("This is a testing string! '*'") << '\n';
    std::cout << co::urlDecode(co::urlEncode("Testing -.*.-()()()")) << '\n';
    std::cout << co::urlDecode("Testing+string+with+spaces") << '\n';
}

void queryStringTest()
{
    std::cout << "QUERYSTRING TEST\n";

    co::UrlEncodedBody body{};
    body.add("test", "testing");
    //body.add("testing key", "! TESTING VALUE ***");
    body.add("=", "&");
    std::cout << std::string(body) << '\n';
}

void requestSerializeTest()
{
    std::cout << "HTTP REQUEST PARSING TEST\n";    
    co::HttpRequest rq("POST", "localhost", 8000, "/testing url", "E=E");
    rq.addHeader("Content-Type", "application/json");
    rq.setBody("{\"test\":true}");
    auto vec = rq.serialize();
    std::cout << std::string(vec.begin(), vec.end()) << '\n';
}

void httpRequestTest()
{
    std::cout << "HTTP REQUEST/RESPONSE TEST\n";

    co::HttpRequest rq("GET", "nullifiedcat.xyz", 80, "/", "");
    co::NonBlockingHttpRequest nrq(rq);
    try {
        nrq.send();
        while (!nrq.update());
        auto response = nrq.getResponse();
        std::cout << "Got response: " << response.getStatus() << "\n" << response.getBody() << "\n";
        std::cout << "Date: " << response.getHeader("Date") << '\n';
    } catch (std::exception& e)
    {
        std::cout << "Error: " << e.what() << "\n";
    }
}

void onlineServiceTest()
{
    co::OnlineService service{};
    service.setHost("localhost:8000");
    service.login("6b649dee81a4e2ae733eb7cd3be460d5", [](co::IdentifiedUser user) {
        std::cout << "Logged in as " << user.username << '\n';
    });
    service.setErrorHandler([](std::string error) {
        std::cout << "API Error: " << error << '\n';
    });
    while (true)
    {
        // Somewhere in game loop
        // Non-blocking function
        service.processPendingCalls();

        using namespace std::chrono_literals;
        std::this_thread::sleep_for(1s);
    }
}

int main()
{
    onlineServiceTest();
    return 0;
}