export declare function login(email: string, password: string): Promise<{
    token: string;
}>;
export declare function register(email: string, password: string, name: string): Promise<{
    token: string;
}>;
