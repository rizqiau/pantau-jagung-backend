export declare class PanenUseCase {
    static inputPanen(payload: any): Promise<{
        siklus: {
            blok: {
                namaBlok: string;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            tanggalTanam: Date;
            status: import("../../generated/client/index.js").$Enums.StatusSiklus;
            blokId: string;
            estimasiPanen: Date;
        };
        mandor: {
            nama: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        siklusId: string;
        mandorId: string;
        catatan: string | null;
        statusVerifikasi: import("../../generated/client/index.js").$Enums.StatusVerifikasi;
        diperiksaOleh: string | null;
        tanggalPanen: Date;
        beratHasil: number;
        hargaJualPerKg: number;
        kualitas: string;
        totalPendapatan: number;
    }>;
    static getAllPanen(): Promise<({
        siklus: {
            blok: {
                lahan: {
                    namaLahan: string;
                };
                namaBlok: string;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            tanggalTanam: Date;
            status: import("../../generated/client/index.js").$Enums.StatusSiklus;
            blokId: string;
            estimasiPanen: Date;
        };
        mandor: {
            nama: string;
        };
        asistenPemeriksa: {
            nama: string;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        siklusId: string;
        mandorId: string;
        catatan: string | null;
        statusVerifikasi: import("../../generated/client/index.js").$Enums.StatusVerifikasi;
        diperiksaOleh: string | null;
        tanggalPanen: Date;
        beratHasil: number;
        hargaJualPerKg: number;
        kualitas: string;
        totalPendapatan: number;
    })[]>;
    static getPanenBySiklus(siklusId: string): Promise<({
        mandor: {
            nama: string;
        };
        asistenPemeriksa: {
            nama: string;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        siklusId: string;
        mandorId: string;
        catatan: string | null;
        statusVerifikasi: import("../../generated/client/index.js").$Enums.StatusVerifikasi;
        diperiksaOleh: string | null;
        tanggalPanen: Date;
        beratHasil: number;
        hargaJualPerKg: number;
        kualitas: string;
        totalPendapatan: number;
    })[]>;
    static verifikasiPanen(id: string, asistenId: string, status: "APPROVED" | "REJECTED"): Promise<{
        mandor: {
            nama: string;
        };
        asistenPemeriksa: {
            nama: string;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        siklusId: string;
        mandorId: string;
        catatan: string | null;
        statusVerifikasi: import("../../generated/client/index.js").$Enums.StatusVerifikasi;
        diperiksaOleh: string | null;
        tanggalPanen: Date;
        beratHasil: number;
        hargaJualPerKg: number;
        kualitas: string;
        totalPendapatan: number;
    }>;
}
//# sourceMappingURL=PanenUseCase.d.ts.map