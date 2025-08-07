import { Request, Response } from 'express';
import { BaseHandler } from '../../../utils/handler/baseHandler';
import { BaseResponse } from '../../../utils/response/baseResponse';
import { ResumeReviewRequest, ProjectGenerationRequest, LeetCodeGenerationRequest } from '../types/openaiTypes';
import { OpenAIService } from '../services/openaiService';
import { OpenAI } from 'openai';
import multer from 'multer';
import path from 'path';

export class OpenAIHandler extends BaseHandler {
    private openaiService: OpenAIService;
    private openaiClient: OpenAI;
    private upload: multer.Multer;

    constructor() {
        super({
            name: 'openai-service',
            port: parseInt(process.env.OPENAI_SERVICE_PORT || '4002'),
            version: 'v1',
            basePath: 'ai'
        });
        
        // Initialize OpenAI client
        this.openaiClient = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
            timeout: 180000, // 3 minutes timeout for OpenAI API calls
        });
        
        // Pass client to service
        this.openaiService = new OpenAIService(this.openaiClient);
        
        // Configure multer for file uploads
        const storage = multer.memoryStorage();
        this.upload = multer({
            storage: storage,
            limits: {
                fileSize: 10 * 1024 * 1024 // 10MB limit
            },
            fileFilter: (req, file, cb) => {
                const allowedTypes = ['.pdf', '.doc', '.docx', '.txt'];
                const ext = path.extname(file.originalname).toLowerCase();
                if (allowedTypes.includes(ext)) {
                    cb(null, true);
                } else {
                    cb(new Error('Invalid file type. Only PDF, DOC, DOCX, and TXT files are allowed.'));
                }
            }
        });
    }

    public setupRoutes(): void {
        // Resume review endpoint (text-based)
        this.router.post('/resume/review', this.reviewResume);
        
        // Resume review endpoint (file upload)
        this.router.post('/resume/review-file', this.reviewResumeFile);
        
        // General resume review endpoints (without job description)
        this.router.post('/resume/general-review', this.generalReviewResume);
        this.router.post('/resume/general-review-file', this.generalReviewResumeFile);
        
        // Project generation endpoint
        this.router.post('/project/generate', this.generateProject);
        
        // LeetCode generation endpoint
        this.router.post('/leetcode/generate', this.generateLeetCode);
    }

    private reviewResume = async (req: Request, res: Response): Promise<void> => {
        try {
            const requestBody = this.validateRequest<ResumeReviewRequest>(req);
            const requestId = (req as any).requestId;

            const reviewResult = await this.openaiService.reviewResume(requestBody.data);

            const response = BaseResponse.success(
                requestId,
                this.config.name,
                reviewResult
            );

            this.sendResponse(res, response);
        } catch (error) {
            const requestId = (req as any).requestId || this.generateRequestId();
            const errorMessage = error instanceof Error ? error.message : 'Failed to review resume';
            
            const response = BaseResponse.badRequest(
                requestId,
                this.config.name,
                errorMessage
            );

            this.sendResponse(res, response);
        }
    };

    private reviewResumeFile = async (req: Request, res: Response): Promise<void> => {
        try {
            const requestId = (req as any).requestId;
            
            // Handle JSON request with base64 file content
            const requestBody = this.validateRequest<{
                fileName: string;
                fileContent: string;
                fileType: string;
                jobDescription?: string;
                company?: string;
            }>(req);
            
            const { fileName, fileContent, jobDescription, company } = requestBody.data;
            
            if (!fileName || !fileContent) {
                throw new Error('Missing file name or content');
            }
            
            // Convert base64 string back to buffer
            const fileBuffer = Buffer.from(fileContent, 'base64');

            const reviewResult = await this.openaiService.reviewResumeFile(
                fileBuffer,
                fileName,
                jobDescription,
                company
            );

            const response = BaseResponse.success(
                requestId,
                this.config.name,
                reviewResult
            );

            this.sendResponse(res, response);
        } catch (error) {
            const requestId = (req as any).requestId || this.generateRequestId();
            const errorMessage = error instanceof Error ? error.message : 'Failed to review resume';
            
            const response = BaseResponse.badRequest(
                requestId,
                this.config.name,
                errorMessage
            );

            this.sendResponse(res, response);
        }
    };

    private generateProject = async (req: Request, res: Response): Promise<void> => {
        try {
            const requestBody = this.validateRequest<ProjectGenerationRequest>(req);
            const requestId = (req as any).requestId;

            const projects = await this.openaiService.generateProject(requestBody.data);

            const response = BaseResponse.success(
                requestId,
                this.config.name,
                projects
            );

            this.sendResponse(res, response);
        } catch (error) {
            const requestId = (req as any).requestId || this.generateRequestId();
            const errorMessage = error instanceof Error ? error.message : 'Failed to generate project';
            
            const response = BaseResponse.badRequest(
                requestId,
                this.config.name,
                errorMessage
            );

            this.sendResponse(res, response);
        }
    };

    private generalReviewResume = async (req: Request, res: Response): Promise<void> => {
        try {
            const requestBody = this.validateRequest<{ resumeText: string }>(req);
            const requestId = (req as any).requestId;

            const reviewResult = await this.openaiService.generalReviewResume(requestBody.data.resumeText);

            const response = BaseResponse.success(
                requestId,
                this.config.name,
                reviewResult
            );

            this.sendResponse(res, response);
        } catch (error) {
            const requestId = (req as any).requestId || this.generateRequestId();
            const errorMessage = error instanceof Error ? error.message : 'Failed to review resume';
            
            const response = BaseResponse.badRequest(
                requestId,
                this.config.name,
                errorMessage
            );

            this.sendResponse(res, response);
        }
    };

    private generalReviewResumeFile = async (req: Request, res: Response): Promise<void> => {
        try {
            const requestId = (req as any).requestId;
            
            // Handle JSON request with base64 file content
            const requestBody = this.validateRequest<{
                fileName: string;
                fileContent: string;
                fileType: string;
            }>(req);
            
            const { fileName, fileContent } = requestBody.data;
            
            if (!fileName || !fileContent) {
                throw new Error('Missing file name or content');
            }
            
            // Convert base64 string back to buffer
            const fileBuffer = Buffer.from(fileContent, 'base64');

            const reviewResult = await this.openaiService.generalReviewResumeFile(
                fileBuffer,
                fileName
            );

            const response = BaseResponse.success(
                requestId,
                this.config.name,
                reviewResult
            );

            this.sendResponse(res, response);
        } catch (error) {
            const requestId = (req as any).requestId || this.generateRequestId();
            const errorMessage = error instanceof Error ? error.message : 'Failed to review resume';
            
            const response = BaseResponse.badRequest(
                requestId,
                this.config.name,
                errorMessage
            );

            this.sendResponse(res, response);
        }
    };

    private generateLeetCode = async (req: Request, res: Response): Promise<void> => {
        try {
            const requestBody = this.validateRequest<LeetCodeGenerationRequest>(req);
            const requestId = (req as any).requestId;

            const problems = await this.openaiService.generateLeetCodeProblems(requestBody.data);

            const response = BaseResponse.success(
                requestId,
                this.config.name,
                problems
            );

            this.sendResponse(res, response);
        } catch (error) {
            const requestId = (req as any).requestId || this.generateRequestId();
            const errorMessage = error instanceof Error ? error.message : 'Failed to generate LeetCode problems';
            
            const response = BaseResponse.badRequest(
                requestId,
                this.config.name,
                errorMessage
            );

            this.sendResponse(res, response);
        }
    };
} 