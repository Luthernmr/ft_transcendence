import { Response } from 'express';
import { Auth42Service } from './auth42.service';
export declare class Auth42Controller {
    private readonly auth42Service;
    constructor(auth42Service: Auth42Service);
    login42(response: Response, request: any): Promise<{
        jwt: any;
    }>;
}
