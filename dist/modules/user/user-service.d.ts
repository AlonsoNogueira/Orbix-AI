export declare function findUserByEmail(email: string, includePassword: boolean): Promise<{
    id: string;
    email: string;
    name: string | null;
    password: string;
    role: import("@prisma/client").$Enums.Role;
    createdAt: Date;
    updatedAt: Date;
} | null>;
export declare function findUserById(userId: string, includePassword: boolean): Promise<{
    id: string;
    email: string;
    name: string | null;
    password: string;
    role: import("@prisma/client").$Enums.Role;
    createdAt: Date;
    updatedAt: Date;
} | null>;
export declare function findAll(includePassword: boolean): Promise<{
    id: string;
    email: string;
    name: string | null;
    password: string;
    role: import("@prisma/client").$Enums.Role;
    createdAt: Date;
    updatedAt: Date;
}[]>;
