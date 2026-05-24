import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { LahanController } from "./delivery/lahan/LahanController.js";
import { PekerjaController } from "./delivery/pekerja/PekerjaController.js";
import { BlokController } from "./delivery/blok/BlokController.js";
import { AktivitasController } from "./delivery/aktivitas/AktivitasController.js";
import { MaterialController } from "./delivery/material/MaterialController.js";
import { VerifikasiController } from "./delivery/verifikasi/VerifikasiController.js";
import { PanenController } from "./delivery/panen/PanenController.js";
import { AuditLogController } from "./delivery/audit/AuditLogController.js";
import { ReportController } from "./delivery/report/ReportController.js";
import { AuthController } from "./delivery/auth/AuthController.js";
import { DashboardController } from "./delivery/dashboard/DashboardController.js";
import { WeatherController } from "./delivery/weather/WeatherController.js";
dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;
app.use(cors());
app.use(express.json({ limit: "10mb" })); // Increased limit for Base64 photos
app.get("/", (req, res) => {
    res.json({
        message: "Selamat datang di API Pantau Jagung Backend!",
        status: "Server berjalan lancar",
    });
});
// --- API ENDPOINTS AUTH ---
app.post("/api/users/login", AuthController.login);
// --- API ENDPOINTS DASHBOARD ---
app.get("/api/dashboard/mandor/:mandorId", DashboardController.getMandorDashboard);
app.get("/api/dashboard/asisten", DashboardController.getAsistenDashboard);
// --- API ENDPOINTS CUACA ---
app.get("/api/weather", WeatherController.getWeather);
// --- API ENDPOINTS LAHAN ---
app.post("/api/lahan", LahanController.create); // POST - Membuat lahan baru
app.get("/api/lahan", LahanController.getAll); // GET - Mengambil semua daftar lahan (Ringkas)
app.get("/api/lahan/:id", LahanController.getById); // GET - Mengambil detail 1 lahan (Sangat lengkap dengan jadwal)
app.put("/api/lahan/:id", LahanController.update); // PUT - Memperbarui informasi dasar lahan
app.delete("/api/lahan/:id", LahanController.delete); // DELETE - Menghapus lahan secara permanen (Cascade)
app.get("/api/lahan/:lahanId/blok-progress", BlokController.getProgressByLahan); // GET - Mengambil progress harian per blok
app.put("/api/jadwal/:id/reschedule", LahanController.reschedule); // POST - Reschedule jadwal
app.get("/api/jadwal/:jadwalId/riwayat", BlokController.getRiwayatJadwal);
// --- API ENDPOINTS PEKERJA (APP USERS) ---
app.post("/api/users/register", PekerjaController.registerUser);
app.get("/api/users", PekerjaController.getAllUsers); // <-- TAMBAHKAN INI (GET ALL)
app.get("/api/users/:id", PekerjaController.getUserById); // <-- TAMBAHKAN INI (GET BY ID)
app.put("/api/users/:id", PekerjaController.updateUser);
app.delete("/api/users/:id", PekerjaController.deleteUser);
// --- API ENDPOINTS PEKERJA HARIAN (MASTER DATA FIELD) ---
app.post("/api/pekerja-harian", PekerjaController.addPekerjaHarian);
app.get("/api/pekerja-harian", PekerjaController.getAllPekerja);
app.put("/api/pekerja-harian/:id", PekerjaController.updatePekerjaHarian); // PUT - Update info kuli harian
app.delete("/api/pekerja-harian/:id", PekerjaController.deletePekerjaHarian); // DELETE - Karyawan Harian Berhenti
// --- API ENDPOINTS AKTIVITAS HARIAN (KEUANGAN & PROGRESS) ---
app.post("/api/aktivitas-harian", AktivitasController.create); // POST - Input Laporan Harian
app.get("/api/aktivitas-harian", AktivitasController.getAll); // GET - List Semua Laporan
// --- API ENDPOINTS VERIFIKASI MANDOR (QUALITY CONTROL) ---
app.post("/api/verifikasi-mandor", VerifikasiController.create); // POST - Mandor kirim laporan foto harian
app.get("/api/verifikasi-mandor/pending", VerifikasiController.getPending); // GET - Laporan PENDING untuk Inbox Asisten
app.get("/api/blok/:blokId/verifikasi", VerifikasiController.getByBlok); // GET - List laporan per blok (Filter Berjenjang)
app.put("/api/verifikasi-mandor/:id/status", VerifikasiController.updateStatus); // PUT - Asisten Lapangan Approve/Reject
// --- API ENDPOINTS KATALOG MATERIAL ---
app.post("/api/material", MaterialController.create);
app.get("/api/material", MaterialController.getAll);
app.put("/api/material/:id", MaterialController.update);
app.delete("/api/material/:id", MaterialController.delete);
app.put("/api/material/:id/restock", MaterialController.restock);
// --- API ENDPOINTS PANEN ---
app.post("/api/panen", PanenController.create);
app.get("/api/panen", PanenController.getAll);
app.get("/api/panen/siklus/:siklusId", PanenController.getBySiklus);
app.put("/api/panen/:id/status", PanenController.updateStatus);
// --- API ENDPOINTS AUDIT LOGS ---
app.get("/api/audit-logs", AuditLogController.getAll);
// --- API ENDPOINTS LAPORAN (REPORTING) ---
app.get("/api/reports/costs", ReportController.getCostReport);
app.get("/api/reports/harvest", ReportController.getHarvestReport);
app.get("/api/reports/download-pdf", ReportController.downloadPdf);
app.listen(PORT, () => {
    console.log(`[Server]: Berjalan di http://localhost:${PORT}`);
});
// Di bagian paling bawah src/index.ts
export default app;
//# sourceMappingURL=index.js.map