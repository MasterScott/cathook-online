#include "UrlEncoding.hpp"

#include <iostream>

void urlEncodingTest()
{
    std::cout << "URL ENCODING TEST\n";

    std::cout << co::urlEncode("This is a testing string! '*'") << '\n';
    std::cout << co::urlDecode(co::urlEncode("Testing -.*.-()()()")) << '\n';
    std::cout << co::urlDecode("Testing+string+with+spaces") << '\n';
}

int main()
{
    urlEncodingTest();
    return 0;
}