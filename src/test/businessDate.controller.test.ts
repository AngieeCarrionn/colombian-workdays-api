/**
 * Tests de integración para el endpoint de fechas hábiles.
 * 
 * Estos tests verifican:
 * 1. Validación de parámetros
 * 2. Cálculo de fechas hábiles
 * 3. Manejo de errores
 * 
 * El endpoint bajo prueba es: GET /api/business-date
 * 
 * @group Integration
 * @group BusinessDate
 */

import request from "supertest";
import express from "express";
import businessDateRouter from "../routes/businessDate.routes";

/**
 * Configuración de la app Express para tests
 * - JSON middleware habilitado
 * - Router montado en /api/business-date
 */
const app = express();
app.use(express.json());
app.use("/api/business-date", businessDateRouter);

describe("BusinessDateController", () => {
  /**
   * Test suite: Validación de parámetros de entrada
   * 
   * Verifica que el endpoint:
   * - Requiera al menos un parámetro (days o hours)
   * - Valide que los valores sean positivos
   * - Valide el formato de fecha ISO
   */
  describe("Validación de parámetros", () => {
    it("debe devolver 400 si faltan los parámetros", async () => {
      const res = await request(app).get("/api/business-date");
      expect(res.status).toBe(400);
      expect(res.body).toEqual(expect.objectContaining({
        status: 400,
        error: "InvalidParameters",
        message: expect.any(String)
      }));
    });

    // TODO: Agregar más tests de validación:
    // - days negativo
    // - hours negativo
    // - fecha en formato inválido
    // - días y horas fuera de rango
  });

  /**
   * Test suite: Cálculo de fechas
   * 
   * Verifica que el cálculo:
   * - Respete el horario laboral (8-5)
   * - Salte almuerzo (12-1)
   * - Salte fines de semana
   * - Maneje correctamente la zona horaria
   */
  describe("Cálculo de fechas", () => {
    // TODO: Agregar tests de cálculo:
    // - Sumar días hábiles
    // - Sumar horas (con cruce de almuerzo)
    // - Sumar días y horas
    // - Manejar fines de semana
    // - Conversión de zonas horarias
  });
});
