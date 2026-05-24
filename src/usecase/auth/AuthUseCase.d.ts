export declare class AuthUseCase {
    /**
     * Login user dengan username & password.
     * Mengembalikan JWT token + data user (tanpa password).
     */
    static login(username: string, password: string): Promise<{
        token: string;
        user: {
            id: string;
            nama: string;
            username: string;
            role: import("@prisma/client").$Enums.RoleUser;
        };
    }>;
}
//# sourceMappingURL=AuthUseCase.d.ts.map