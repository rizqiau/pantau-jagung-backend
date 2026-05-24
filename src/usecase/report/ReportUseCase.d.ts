export declare class ReportUseCase {
    /**
     * Mengambil laporan biaya lengkap dengan semua agregasi yang dibutuhkan.
     */
    static getCostReport(lahanId?: string): Promise<{
        totalBiayaSeluruhnya: number;
        totalBiayaHK: number;
        totalBiayaMaterial: number;
        totalKegiatan: number;
        totalHK: number;
        totalJenisMaterial: number;
        biayaPerHa: number;
        perKegiatan: any[];
        biayaKumulatif: {
            nama: string;
            total: number;
        }[];
        perLahan: any[];
        perBlok: any[];
        perSiklus: any[];
        perJadwal: any[];
        perHari: any[];
        perMinggu: any[];
        detailKegiatan: any[];
        progressBudidaya: any;
    }>;
    /**
     * Mengambil laporan panen.
     */
    static getHarvestReport(lahanId?: string): Promise<{
        totalBeratSeluruhnya: number;
        totalPendapatanSeluruhnya: number;
        perLahan: any[];
        perBulan: any[];
    }>;
}
//# sourceMappingURL=ReportUseCase.d.ts.map