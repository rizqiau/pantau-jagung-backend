// File: src/delivery/AuthController.ts
import { Request, Response } from "express";
import { AuthUseCase } from "../../usecase/auth/AuthUseCase.js";

export class AuthController {
  // POST /api/users/login
  static async login(req: Request, res: Response) {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        throw new Error("Username dan password wajib diisi");
      }

      const result = await AuthUseCase.login(username, password);

      res.status(200).json({
        success: true,
        message: "Login berhasil",
        data: result,
      });
    } catch (error: any) {
      res.status(401).json({
        success: false,
        error: error.message,
      });
    }
  }
}
