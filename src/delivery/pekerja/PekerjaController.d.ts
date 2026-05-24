import { Request, Response } from "express";
export declare class PekerjaController {
    static registerUser(req: Request, res: Response): Promise<void>;
    static getAllUsers(req: Request, res: Response): Promise<void>;
    static getUserById(req: Request, res: Response): Promise<void>;
    static updateUser(req: Request, res: Response): Promise<void>;
    static deleteUser(req: Request, res: Response): Promise<void>;
    static addPekerjaHarian(req: Request, res: Response): Promise<void>;
    static getAllPekerja(req: Request, res: Response): Promise<void>;
    static updatePekerjaHarian(req: Request, res: Response): Promise<void>;
    static deletePekerjaHarian(req: Request, res: Response): Promise<void>;
}
//# sourceMappingURL=PekerjaController.d.ts.map