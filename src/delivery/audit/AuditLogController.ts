// File: src/delivery/AuditLogController.ts
import { Request, Response } from "express";
import { AuditLogUseCase } from "../../usecase/audit/AuditLogUseCase.js";

export class AuditLogController {
  // GET - Mengambil semua daftar catatan audit log di sistem
  static async getAll(req: Request, res: Response) {
    try {
      const logs = await AuditLogUseCase.getAllLogs();

      res.status(200).json({
        success: true,
        data: logs,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }
}
