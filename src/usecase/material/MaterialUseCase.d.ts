export declare class MaterialUseCase {
    static createMaterial(payload: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        hargaSatuan: number;
        namaMaterial: string;
        kategori: string;
        satuan: string;
        stok: number;
    }>;
    static getAllMaterials(kategori?: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        hargaSatuan: number;
        namaMaterial: string;
        kategori: string;
        satuan: string;
        stok: number;
    }[]>;
    static updateMaterial(id: string, payload: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        hargaSatuan: number;
        namaMaterial: string;
        kategori: string;
        satuan: string;
        stok: number;
    }>;
    static deleteMaterial(id: string, operatorId?: string | null): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        hargaSatuan: number;
        namaMaterial: string;
        kategori: string;
        satuan: string;
        stok: number;
    }>;
    static restockMaterial(id: string, payload: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        hargaSatuan: number;
        namaMaterial: string;
        kategori: string;
        satuan: string;
        stok: number;
    }>;
}
//# sourceMappingURL=MaterialUseCase.d.ts.map