import { Request, Response } from "express";
/**
 * Weather Controller - Proxy cuaca sederhana.
 * Menggunakan Open-Meteo API (gratis, tanpa API key).
 * Koordinat default: area perkebunan jagung umum di Indonesia.
 */
export declare class WeatherController {
    static getWeather(req: Request, res: Response): Promise<void>;
}
//# sourceMappingURL=WeatherController.d.ts.map