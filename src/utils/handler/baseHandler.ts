import express, { Request, Response, NextFunction, Router } from 'express';
import cors from 'cors';
import { BaseRequestBody, BaseResponseBody, BaseResponse } from '../response/baseResponse';

export interface ServiceConfig {
    name: string;
    port: number;
    version: string;    
    basePath: string;
}

export abstract class BaseHandler {
    protected app: express.Application;
    protected router: Router;
    protected config: ServiceConfig;

    constructor(config: ServiceConfig) {
        this.config = config;
        this.app = express();
        this.router = Router();
        this.setupMiddleware();
        this.setupErrorHandling();
    }

    private setupMiddleware(): void {
        // Increase body size limit to 10MB for file uploads (resumes)
        this.app.use(express.json({ limit: '10mb' }));
        this.app.use(express.urlencoded({ limit: '10mb', extended: true }));
        this.app.use(cors());
        this.app.use(this.requestIdMiddleware);
        this.app.use(this.loggingMiddleware);
    }

    private requestIdMiddleware = (req: Request, res: Response, next: NextFunction): void => {
        (req as any).requestId = req.headers['x-request-id'] || this.generateRequestId();
        res.setHeader('X-Request-ID', (req as any).requestId);
        next();
    };

    private loggingMiddleware = (req: Request, res: Response, next: NextFunction): void => {
        const start = Date.now();
        res.on('finish', () => {
            const duration = Date.now() - start;
            console.log(`[${this.config.name}] ${req.method} ${req.path} - ${res.statusCode} - ${duration}ms`);
        });
        next();
    };

    private setupErrorHandling(): void {
        this.app.use(this.errorHandler);
    }

    private errorHandler = (err: Error, req: Request, res: Response, next: NextFunction): void => {
        const requestId = (req as any).requestId || this.generateRequestId();
        console.error(`[${this.config.name}] Error:`, err);
        
        const response = BaseResponse.internalError(
            requestId,
            this.config.name,
            'An unexpected error occurred',
            process.env.NODE_ENV === 'development' ? err.stack : undefined
        );
        
        res.status(500).json(response);
    };

    protected validateRequest<T>(req: Request): BaseRequestBody<T> {
        const body = req.body as BaseRequestBody<T>;
        
        if (!body.requestId || !body.timestamp || !body.service || !body.data) {
            throw new Error('Invalid request format');
        }
        
        return body;
    }

    protected sendResponse<T>(res: Response, response: BaseResponseBody<T>): void {
        res.status(response.status.code).json(response);
    }

    protected generateRequestId(): string {
        return `${this.config.name}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    public abstract setupRoutes(): void;

    public listen(): void {
        this.setupRoutes();
        this.app.use(`/api/${this.config.version}/${this.config.basePath}`, this.router);
        
        this.app.get('/health', (req: Request, res: Response) => {
            res.json({
                service: this.config.name,
                status: 'healthy',
                timestamp: new Date().toISOString()
            });
        });

        this.app.listen(this.config.port, () => {
            console.log(`[${this.config.name}] Service running on port ${this.config.port}`);
        });
    }
} 