import type { IncomingHttpHeaders } from "node:http";
import type { Request } from "express";
export declare function handlePaymentWebhook(rawBody: string, headers: IncomingHttpHeaders, _query: Request["query"]): Promise<void>;
