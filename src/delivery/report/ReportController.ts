import { Request, Response } from "express";
import { ReportUseCase } from "../../usecase/report/ReportUseCase.js";
import PDFDocument from "pdfkit";

export class ReportController {
  static async getCostReport(req: Request, res: Response) {
    try {
      const lahanId = req.query.lahanId as string | undefined;
      const data = await ReportUseCase.getCostReport(lahanId);
      res.status(200).json({ success: true, data });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async getHarvestReport(req: Request, res: Response) {
    try {
      const lahanId = req.query.lahanId as string | undefined;
      const data = await ReportUseCase.getHarvestReport(lahanId);
      res.status(200).json({ success: true, data });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async downloadPdf(req: Request, res: Response) {
    try {
      const lahanId = req.query.lahanId as string | undefined;
      const costData = await ReportUseCase.getCostReport(lahanId);
      const harvestData = await ReportUseCase.getHarvestReport(lahanId);

      const doc = new PDFDocument({ margin: 40, size: "A4" });

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", "attachment; filename=laporan-pantau-jagung.pdf");
      doc.pipe(res);

      // ─── HEADER ───
      doc.fontSize(20).font("Helvetica-Bold").text("Laporan PantauJagung", { align: "center" });
      doc.fontSize(10).font("Helvetica").text(`Dicetak: ${new Date().toLocaleDateString("id-ID")}`, { align: "center" });
      doc.moveDown(1.5);

      // ─── RINGKASAN BIAYA ───
      doc.fontSize(16).font("Helvetica-Bold").text("Ringkasan Biaya");
      doc.moveDown(0.5);
      doc.fontSize(11).font("Helvetica");

      const formatRp = (n: number) => `Rp ${n.toLocaleString("id-ID")}`;

      doc.text(`Total Biaya Seluruhnya: ${formatRp(costData.totalBiayaSeluruhnya)}`);
      doc.text(`Biaya per Hektar: ${formatRp(costData.biayaPerHa)}`);
      doc.text(`Total Biaya HK (Pekerja): ${formatRp(costData.totalBiayaHK)} (${costData.totalBiayaSeluruhnya > 0 ? Math.round((costData.totalBiayaHK / costData.totalBiayaSeluruhnya) * 100) : 0}%)`);
      doc.text(`Total Biaya Material: ${formatRp(costData.totalBiayaMaterial)} (${costData.totalBiayaSeluruhnya > 0 ? Math.round((costData.totalBiayaMaterial / costData.totalBiayaSeluruhnya) * 100) : 0}%)`);
      doc.text(`Total Kegiatan: ${costData.totalKegiatan}`);
      doc.text(`Total Pekerja (Unik): ${costData.totalHK} orang`);
      doc.text(`Total Jenis Material: ${costData.totalJenisMaterial} jenis`);
      doc.moveDown(1);

      // ─── BIAYA PER KEGIATAN ───
      doc.fontSize(14).font("Helvetica-Bold").text("Biaya per Kegiatan");
      doc.moveDown(0.5);
      doc.fontSize(10).font("Helvetica");

      costData.perKegiatan.forEach((item: any, idx: number) => {
        doc.text(`${idx + 1}. ${item.nama}: ${formatRp(item.total)}`);
      });
      doc.moveDown(1);

      // ─── BIAYA PER LAHAN ───
      doc.fontSize(14).font("Helvetica-Bold").text("Biaya per Lahan");
      doc.moveDown(0.5);
      doc.fontSize(10).font("Helvetica");

      costData.perLahan.forEach((item: any, idx: number) => {
        doc.text(`${idx + 1}. ${item.nama}: ${formatRp(item.total)}`);
      });
      doc.moveDown(1);

      // ─── DETAIL KEGIATAN ───
      if (costData.detailKegiatan.length > 0) {
        doc.addPage();
        doc.fontSize(16).font("Helvetica-Bold").text("Detail Kegiatan");
        doc.moveDown(0.5);

        costData.detailKegiatan.forEach((dk: any) => {
          doc.fontSize(12).font("Helvetica-Bold").text(`${dk.kegiatan} — ${dk.tanggal} (HST ${dk.hstKe})`);
          doc.fontSize(10).font("Helvetica");
          doc.text(`  Total Biaya: ${formatRp(dk.totalBiaya)} | Biaya/ha: ${formatRp(dk.biayaPerHa)}`);
          doc.text(`  Biaya HK: ${formatRp(dk.totalBiayaHK)} (${dk.totalHK} orang) | Biaya Material: ${formatRp(dk.totalBiayaMaterial)} (${dk.totalJenisMaterial} jenis)`);

          if (dk.rincianHK.length > 0) {
            doc.text(`  Rincian HK: ${dk.rincianHK.map((h: any) => `${h.nama} (${formatRp(h.upah)})`).join(", ")}`);
          }
          if (dk.rincianMaterial.length > 0) {
            doc.text(`  Rincian Material: ${dk.rincianMaterial.map((m: any) => `${m.nama} ${m.jumlah} ${m.satuan} (${formatRp(m.total)})`).join(", ")}`);
          }
          doc.moveDown(0.5);
        });
      }

      // ─── RINGKASAN PANEN ───
      doc.addPage();
      doc.fontSize(16).font("Helvetica-Bold").text("Ringkasan Panen");
      doc.moveDown(0.5);
      doc.fontSize(11).font("Helvetica");

      doc.text(`Total Berat Panen: ${harvestData.totalBeratSeluruhnya.toLocaleString("id-ID")} Kg`);
      doc.text(`Total Pendapatan: ${formatRp(harvestData.totalPendapatanSeluruhnya)}`);
      doc.moveDown(1);

      doc.fontSize(14).font("Helvetica-Bold").text("Panen per Lahan");
      doc.moveDown(0.5);
      doc.fontSize(10).font("Helvetica");

      harvestData.perLahan.forEach((item: any, idx: number) => {
        doc.text(`${idx + 1}. ${item.nama}: ${item.totalBerat.toLocaleString("id-ID")} Kg — ${formatRp(item.totalPendapatan)}`);
      });

      doc.end();
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
}
