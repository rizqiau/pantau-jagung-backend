export declare class VerifikasiUseCase {
    static createVerifikasi(payload: any): Promise<{
        hasilKerjaPekerja: ({
            pekerja: {
                nama: string;
            };
        } & {
            id: string;
            luasDikerjakan: number;
            pekerjaId: string;
            fotoBukti: string | null;
            verifikasiId: string;
        })[];
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
    }>;
    static getVerifikasiByBlok(blokId: string): Promise<({
        hasilKerjaPekerja: ({
            pekerja: {
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
        jadwal: {
            kegiatan: string;
            mingguKe: number;
        };
        mandor: {
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
    static getVerifikasiPending(): Promise<({
        hasilKerjaPekerja: ({
            pekerja: {
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
        jadwal: {
            kegiatan: string;
            mingguKe: number;
        };
        mandor: {
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
    static batasiAtauVerifikasiLaporan(id: string, asistenId: string, status: "APPROVED" | "REJECTED"): Promise<any>;
}
//# sourceMappingURL=VerifikasiUseCase.d.ts.map