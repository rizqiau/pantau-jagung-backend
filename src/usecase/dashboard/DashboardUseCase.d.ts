export declare class DashboardUseCase {
    /**
     * Dashboard Summary untuk Mandor:
     * - Jumlah blok aktif yang ditugaskan
     * - Kegiatan hari ini
     * - Total data belum disinkronkan (placeholder, dihitung di Android)
     */
    static getMandorDashboard(mandorId: string): Promise<{
        kegiatanHariIni: ({
            siklus: {
                blok: {
                    lahan: {
                        namaLahan: string;
                    };
                } & {
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    namaBlok: string;
                    luasBlok: number;
                    lahanId: string;
                };
            } & {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                tanggalTanam: Date;
                status: import("@prisma/client").$Enums.StatusSiklus;
                blokId: string;
                estimasiPanen: Date;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            tanggalJadwal: Date;
            siklusId: string;
            kegiatan: string;
            mingguKe: number;
            status: import("@prisma/client").$Enums.StatusKegiatan;
            luasSelesai: number;
        })[];
        aktivitasTerakhir: ({
            jadwal: {
                kegiatan: string;
                siklus: {
                    blok: {
                        namaBlok: string;
                    };
                };
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            jadwalId: string;
            mandorId: string;
            tanggal: Date;
            luasDikerjakan: number;
            totalBiayaPekerja: number;
            totalBiayaMaterial: number;
        })[];
        totalPendingQc: number;
        totalPendingPanen: number;
        totalPending: number;
        blokProgress: {
            id: string;
            namaBlok: string;
            luasBlok: number;
            statusSiklus: import("@prisma/client").$Enums.StatusSiklus;
            jadwalId: string | null;
            kegiatanAktif: string | null;
            mingguKe: number | null;
            luasSelesai: number;
            persentaseProgress: number;
        }[];
        statistikMingguan: {
            totalLuasDikerjakan: number;
            rataRataPekerjaPerHari: number;
            jumlahHariKerja: number;
            totalBiaya: number;
        };
    }>;
    /**
     * Dashboard Summary untuk Asisten Lapangan:
     * - Total hektar perkebunan
     * - Grafik keuangan mingguan
     * - Jumlah laporan pending yang menunggu persetujuan
     */
    static getAsistenDashboard(): Promise<{
        totalLuasHektar: number;
        totalLahan: number;
        totalBlok: number;
        siklusAktif: number;
        pendingApprovals: number;
        pendingVerifikasi: number;
        pendingPanen: number;
        keuanganMingguIni: {
            totalBiayaPekerja: number;
            totalBiayaMaterial: number;
            totalBiaya: number;
        };
        pendapatanMingguIni: number;
        materialLowStock: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            hargaSatuan: number;
            namaMaterial: string;
            kategori: string;
            satuan: string;
            stok: number;
        }[];
    }>;
}
//# sourceMappingURL=DashboardUseCase.d.ts.map