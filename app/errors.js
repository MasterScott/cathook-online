'use strict';

class StatusError extends Error
{
    constructor(status, message)
    {
        if (typeof message == 'object')
            message = JSON.stringify(message);
        super(message);
        this.status = status;
        Error.captureStackTrace(this, StatusError);
    }
}

class BadRequest extends StatusError
{
    constructor(message = 'Bad Request')
    {
        super(400, message);
    }
}

class Unauthorized extends StatusError
{
    constructor(message = 'Unauthorized')
    {
        super(401, message);
    }
}

class Forbidden extends StatusError
{
    constructor(message = 'Forbidden')
    {
        super(403, message);
    }
}

class NotFound extends StatusError
{
    constructor(message = 'Not Found')
    {
        super(404, message);
    }
}

class Conflict extends StatusError
{
    constructor(message = 'Conflict')
    {
        super(409, message);
    }
}

class PayloadTooLarge extends StatusError
{
    constructor(message = 'Payload Too Large')
    {
        super(413, message);
    }
}

class UnprocessableEntity extends StatusError
{
    constructor(message = 'Unprocessable Entity')
    {
        super(422, message);
    }
}

class TooManyRequests extends StatusError
{
    constructor(message = 'Too Many Requests')
    {
        super(429, message);
    }
}

class InternalServerError extends StatusError
{
    constructor(message = 'Internal Server Error')
    {
        super(500, message);
    }
}

class NotImplemented extends StatusError
{
    constructor(message = 'Not Implemented')
    {
        super(501, message);
    }
}

module.exports = {
    StatusError,
    BadRequest,
    Unauthorized,
    Forbidden,
    NotFound,
    Conflict,
    PayloadTooLarge,
    UnprocessableEntity,
    TooManyRequests,
    InternalServerError,
    NotImplemented
}