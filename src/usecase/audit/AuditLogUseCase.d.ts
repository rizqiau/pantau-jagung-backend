export declare class AuditLogUseCase {
    /**
     * Rekam catatan audit log ke database.
     * Fungsi ini menerima objek `tx` (Prisma client atau Transaction context)
     * agar pencatatan log dapat berjalan secara atomik di dalam transaksi bisnis utama.
     */
    static record(tx: any, payload: {
        userId: string | null;
        action: "CREATE" | "UPDATE" | "DELETE";
        tableName: string;
        recordId: string | null;
        details?: string | null;
    }): Promise<any>;
    /**
     * Ambil semua daftar audit log di sistem untuk keperluan pengawasan (Audit & Compliance).
     * Diurutkan dari yang terbaru ke terlama.
     */
    static getAllLogs(): Promise<({
        user: {
            id: string;
            nama: string;
            role: import("@prisma/client").$Enums.RoleUser;
        } | null;
    } & {
        id: string;
        userId: string | null;
        action: string;
        tableName: string;
        recordId: string | null;
        details: string | null;
        timestamp: Date;
    })[]>;
}
//# sourceMappingURL=AuditLogUseCase.d.ts.map