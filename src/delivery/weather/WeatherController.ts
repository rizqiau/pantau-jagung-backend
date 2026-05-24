// File: src/delivery/WeatherController.ts
import { Request, Response } from "express";

/**
 * Weather Controller - Proxy cuaca sederhana.
 * Menggunakan Open-Meteo API (gratis, tanpa API key).
 * Koordinat default: area perkebunan jagung umum di Indonesia.
 */
export class WeatherController {
  // GET /api/weather?lat=-6.9&lon=107.6
  static async getWeather(req: Request, res: Response) {
    try {
      const lat = req.query.lat || "-6.9";
      const lon = req.query.lon || "107.6";

      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=Asia%2FJakarta&forecast_days=7`;

      const response = await fetch(url);
      const data = await response.json();

      // Map weather code ke deskripsi bahasa Indonesia
      const weatherDescriptions: Record<number, string> = {
        0: "Cerah",
        1: "Sebagian Cerah",
        2: "Berawan Sebagian",
        3: "Mendung",
        45: "Berkabut",
        48: "Berkabut Tebal",
        51: "Gerimis Ringan",
        53: "Gerimis",
        55: "Gerimis Lebat",
        61: "Hujan Ringan",
        63: "Hujan Sedang",
        65: "Hujan Lebat",
        80: "Hujan Lokal Ringan",
        81: "Hujan Lokal",
        82: "Hujan Lokal Lebat",
        95: "Badai Petir",
        96: "Badai Petir + Hujan Es Ringan",
        99: "Badai Petir + Hujan Es Lebat",
      };

      const currentWeatherCode = data.current?.weather_code ?? 0;
      const currentDescription =
        weatherDescriptions[currentWeatherCode] || "Tidak Diketahui";

      res.status(200).json({
        success: true,
        data: {
          current: {
            temperature: data.current?.temperature_2m,
            humidity: data.current?.relative_humidity_2m,
            windSpeed: data.current?.wind_speed_10m,
            weatherCode: currentWeatherCode,
            description: currentDescription,
          },
          daily: data.daily,
        },
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: "Gagal mengambil data cuaca: " + error.message,
      });
    }
  }
}
