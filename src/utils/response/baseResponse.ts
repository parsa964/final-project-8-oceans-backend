export interface BaseRequestBody<T> {
    requestId: string;
    timestamp: string;
    service: string;
    data: T;
}

export interface BaseResponseBody<T> {
    requestId: string;
    timestamp: string;
    service: string;
    status: ResponseStatus;
    data?: T;
    error?: ErrorDetails;
}

export interface ResponseStatus {
    code: number;
    message: string;
}

export interface ErrorDetails {
    code: string;
    message: string;
    details?: any;
}

export class BaseResponse {
    static success<T>(requestId: string, service: string, data: T): BaseResponseBody<T> {
        return {
            requestId,
            timestamp: new Date().toISOString(),
            service,
            status: {
                code: 200,
                message: 'Success'
            },
            data
        };
    }

    static created<T>(requestId: string, service: string, data: T): BaseResponseBody<T> {
        return {
            requestId,
            timestamp: new Date().toISOString(),
            service,
            status: {
                code: 201,
                message: 'Created'
            },
            data
        };
    }

    static error(requestId: string, service: string, code: number, error: ErrorDetails): BaseResponseBody<any> {
        return {
            requestId,
            timestamp: new Date().toISOString(),
            service,
            status: {
                code,
                message: 'Error'
            },
            error
        };
    }

    static badRequest(requestId: string, service: string, message: string, details?: any): BaseResponseBody<any> {
        return this.error(requestId, service, 400, {
            code: 'BAD_REQUEST',
            message,
            details
        });
    }

    static notFound(requestId: string, service: string, message: string): BaseResponseBody<any> {
        return this.error(requestId, service, 404, {
            code: 'NOT_FOUND',
            message
        });
    }

    static internalError(requestId: string, service: string, message: string, details?: any): BaseResponseBody<any> {
        return this.error(requestId, service, 500, {
            code: 'INTERNAL_ERROR',
            message,
            details
        });
    }

    static serviceUnavailable(requestId: string, service: string): BaseResponseBody<any> {
        return this.error(requestId, service, 503, {
            code: 'SERVICE_UNAVAILABLE',
            message: 'Service temporarily unavailable'
        });
    }
} 