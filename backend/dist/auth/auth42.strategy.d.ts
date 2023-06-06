import 'dotenv/config';
declare const auth42Strategy_base: new (...args: any[]) => any;
export declare class auth42Strategy extends auth42Strategy_base {
    constructor();
    validate(access_token: string, refresh_token: string, user: any): any;
}
export {};
