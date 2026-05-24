import { DashboardUseCase } from "../../usecase/dashboard/DashboardUseCase.js";
export class DashboardController {
    // GET /api/dashboard/mandor/:mandorId
    static async getMandorDashboard(req, res) {
        try {
            const mandorId = req.params.mandorId;
            if (!mandorId)
                throw new Error("ID Mandor wajib disertakan");
            const dashboard = await DashboardUseCase.getMandorDashboard(mandorId);
            res.status(200).json({
                success: true,
                data: dashboard,
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: error.message,
            });
        }
    }
    // GET /api/dashboard/asisten
    static async getAsistenDashboard(req, res) {
        try {
            const dashboard = await DashboardUseCase.getAsistenDashboard();
            res.status(200).json({
                success: true,
                data: dashboard,
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
//# sourceMappingURL=DashboardController.js.map