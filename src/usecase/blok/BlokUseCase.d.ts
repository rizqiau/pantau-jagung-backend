export declare class BlokUseCase {
    static getBlokProgressByLahan(lahanId: string): Promise<({
        id: string;
        namaBlok: string;
        luasBlok: number;
        kegiatanAktif: string;
        persentaseProgress: number;
        jadwal: never[];
        statusSiklus?: never;
        jadwalId?: never;
        mingguKe?: never;
        luasSelesai?: never;
    } | {
        id: string;
        namaBlok: string;
        luasBlok: number;
        statusSiklus: import("@prisma/client").$Enums.StatusSiklus;
        jadwalId: string | null;
        kegiatanAktif: string;
        mingguKe: number | null;
        luasSelesai: number;
        persentaseProgress: number;
        jadwal?: never;
    })[]>;
    static getRiwayatPekerjaanByJadwal(jadwalId: string): Promise<({
        hasilKerjaPekerja: ({
            pekerja: {
                id: string;
                nama: string;
                peran: string | null;
            };
        } & {
            id: string;
            luasDikerjakan: number;
            pekerjaId: string;
            fotoBukti: string | null;
            verifikasiId: string;
        })[];
        mandor: {
            id: string;
            nama: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        blokId: string;
        jadwalId: string;
        mandorId: string;
        tanggal: Date;
        catatan: string | null;
        statusVerifikasi: import("@prisma/client").$Enums.StatusVerifikasi;
        diperiksaOleh: string | null;
    })[]>;
}
//# sourceMappingURL=BlokUseCase.d.ts.map