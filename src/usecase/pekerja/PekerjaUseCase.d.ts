export declare class PekerjaUseCase {
    static registerUser(payload: any): Promise<{
        id: string;
        nama: string;
        username: string;
        role: import("../../generated/client/index.js").$Enums.RoleUser;
        createdAt: Date;
    }>;
    static getAllUsers(): Promise<{
        id: string;
        nama: string;
        username: string;
        role: import("../../generated/client/index.js").$Enums.RoleUser;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    static getUserById(id: string): Promise<{
        id: string;
        nama: string;
        username: string;
        role: import("../../generated/client/index.js").$Enums.RoleUser;
        createdAt: Date;
        updatedAt: Date;
    } | null>;
    static updateUser(id: string, payload: any): Promise<{
        id: string;
        nama: string;
        username: string;
        role: import("../../generated/client/index.js").$Enums.RoleUser;
        updatedAt: Date;
    }>;
    static deleteUser(id: string, operatorId?: string | null): Promise<{
        id: string;
        nama: string;
        username: string;
        password: string;
        role: import("../../generated/client/index.js").$Enums.RoleUser;
        createdAt: Date;
        updatedAt: Date;
    }>;
    static addPekerjaHarian(payload: any): Promise<{
        id: string;
        nama: string;
        createdAt: Date;
        updatedAt: Date;
        peran: string | null;
    }>;
    static getAllPekerjaHarian(): Promise<{
        id: string;
        nama: string;
        createdAt: Date;
        updatedAt: Date;
        peran: string | null;
    }[]>;
    static updatePekerjaHarian(id: string, payload: any): Promise<{
        id: string;
        nama: string;
        createdAt: Date;
        updatedAt: Date;
        peran: string | null;
    }>;
    static deletePekerjaHarian(id: string, operatorId?: string | null): Promise<{
        id: string;
        nama: string;
        createdAt: Date;
        updatedAt: Date;
        peran: string | null;
    }>;
}
//# sourceMappingURL=PekerjaUseCase.d.ts.map