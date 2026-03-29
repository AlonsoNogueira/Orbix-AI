type Message = {
    role: "user" | "assistant" | "system";
    content: string;
};
export declare function askGroq(messages: Message[]): Promise<any>;
export {};
