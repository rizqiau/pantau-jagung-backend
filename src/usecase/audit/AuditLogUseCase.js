// File: src/usecase/AuditLogUseCase.ts
import { prisma } from "../../infrastructure/prisma.js";
export class AuditLogUseCase {
    /**
     * Rekam catatan audit log ke database.
     * Fungsi ini menerima objek `tx` (Prisma client atau Transaction context)
     * agar pencatatan log dapat berjalan secara atomik di dalam transaksi bisnis utama.
     */
    static async record(tx, payload) {
        try {
            return await tx.auditLog.create({
                data: {
                    userId: payload.userId,
                    action: payload.action,
                    tableName: payload.tableName,
                    recordId: payload.recordId,
                    details: payload.details || null,
                },
            });
        }
        catch (error) {
            console.error("[AuditLog Error]: Gagal mencatat audit log:", error.message);
            // Lempar error agar transaksi dibatalkan jika logging gagal (Atomic Integrity)
            throw new Error(`Gagal mencatat audit trail: ${error.message}`);
        }
    }
    /**
     * Ambil semua daftar audit log di sistem untuk keperluan pengawasan (Audit & Compliance).
     * Diurutkan dari yang terbaru ke terlama.
     */
    static async getAllLogs() {
        return await prisma.auditLog.findMany({
            orderBy: { timestamp: "desc" },
            include: {
                user: {
                    select: {
                        id: true,
                        nama: true,
                        role: true,
                    },
                },
            },
        });
    }
}
//# sourceMappingURL=AuditLogUseCase.js.map