export declare class AktivitasUseCase {
    static inputAktivitasHarian(payload: any): Promise<{
        kehadiranPekerja: {
            id: string;
            upahHarian: number;
            pekerjaId: string;
            aktivitasId: string;
        }[];
        pemakaianMaterial: {
            id: string;
            jumlahPakai: number;
            hargaSatuan: number;
            materialId: string;
            aktivitasId: string;
        }[];
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
    }>;
    static getAllAktivitas(): Promise<{
        totalBiayaKeseluruhan: number;
        jadwal: {
            kegiatan: string;
            mingguKe: number;
        };
        mandor: {
            nama: string;
        };
        id: string;
        createdAt: Date;
        updatedAt: Date;
        jadwalId: string;
        mandorId: string;
        tanggal: Date;
        luasDikerjakan: number;
        totalBiayaPekerja: number;
        totalBiayaMaterial: number;
    }[]>;
}
//# sourceMappingURL=AktivitasUseCase.d.ts.map