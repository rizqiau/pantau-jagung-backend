import { AuditLogUseCase } from "../../usecase/audit/AuditLogUseCase.js";
export class AuditLogController {
    // GET - Mengambil semua daftar catatan audit log di sistem
    static async getAll(req, res) {
        try {
            const logs = await AuditLogUseCase.getAllLogs();
            res.status(200).json({
                success: true,
                data: logs,
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: error.message,
            });
        }
    }
}
//# sourceMappingURL=AuditLogController.js.map