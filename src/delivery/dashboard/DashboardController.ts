// File: src/delivery/DashboardController.ts
import { Request, Response } from "express";
import { DashboardUseCase } from "../../usecase/dashboard/DashboardUseCase.js";

export class DashboardController {
  // GET /api/dashboard/mandor/:mandorId
  static async getMandorDashboard(req: Request, res: Response) {
    try {
      const mandorId = req.params.mandorId as string;
      if (!mandorId) throw new Error("ID Mandor wajib disertakan");

      const dashboard = await DashboardUseCase.getMandorDashboard(mandorId);

      res.status(200).json({
        success: true,
        data: dashboard,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  // GET /api/dashboard/asisten
  static async getAsistenDashboard(req: Request, res: Response) {
    try {
      const dashboard = await DashboardUseCase.getAsistenDashboard();

      res.status(200).json({
        success: true,
        data: dashboard,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }
}
