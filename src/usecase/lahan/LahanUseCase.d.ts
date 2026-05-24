export declare class LahanUseCase {
    static createLahanBerjenjang(payload: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        namaLahan: string;
        latitude: number;
        longitude: number;
        luasTotal: number;
    }>;
    static getAllLahan(): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        namaLahan: string;
        latitude: number;
        longitude: number;
        luasTotal: number;
    }[]>;
    static getLahanById(id: string): Promise<({
        blok: ({
            siklusTanam: ({
                jadwalPerawatan: {
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    tanggalJadwal: Date;
                    siklusId: string;
                    kegiatan: string;
                    mingguKe: number;
                    status: import("../../generated/client/index.js").$Enums.StatusKegiatan;
                    luasSelesai: number;
                }[];
            } & {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                tanggalTanam: Date;
                status: import("../../generated/client/index.js").$Enums.StatusSiklus;
                blokId: string;
                estimasiPanen: Date;
            })[];
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            namaBlok: string;
            luasBlok: number;
            lahanId: string;
        })[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        namaLahan: string;
        latitude: number;
        longitude: number;
        luasTotal: number;
    }) | null>;
    static updateLahan(id: string, payload: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        namaLahan: string;
        latitude: number;
        longitude: number;
        luasTotal: number;
    }>;
    static deleteLahan(id: string, operatorId?: string | null): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        namaLahan: string;
        latitude: number;
        longitude: number;
        luasTotal: number;
    }>;
    static rescheduleJadwal(jadwalId: string, tanggalBaruString: string, operatorId?: string | null): Promise<{
        message: string;
        terdampak: number;
        hariDigeser?: never;
        totalJadwalTerdampak?: never;
    } | {
        message: string;
        hariDigeser: number;
        totalJadwalTerdampak: number;
        terdampak?: never;
    }>;
}
//# sourceMappingURL=LahanUseCase.d.ts.map