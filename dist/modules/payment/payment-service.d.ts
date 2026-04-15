/** Regra de negócio: R$ 1,00 = 5 créditos */
export declare function calcCredits(amountCents: number): number;
export interface CheckoutResult {
    url: string;
    credits: number;
    amountCents: number;
}
interface CustomerExtras {
    cellphone?: string;
    taxId?: string;
}
export declare function createBillingCheckout(userId: string, amountCents: number, extras?: CustomerExtras): Promise<CheckoutResult>;
export {};
