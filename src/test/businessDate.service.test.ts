/**
 * Pruebas unitarias para la clase BusinessDateService.
 *
 * Estas pruebas verifican:
 * - Validación de parámetros
 * - Cálculos de días hábiles y horas hábiles
 * - Manejo de días festivos y fines de semana
 * - Casos límite para diferentes zonas horarias
 *
 * @group Unit
 * @group BusinessDate
 */

import { describe, it, expect } from "vitest";
import { BusinessDateService } from "../domain/services/businessDate.service";

describe("BusinessDateService", () => {
  it("lanza error si no se proporcionan parámetros", async () => {
    const service = new BusinessDateService();
    await expect(service.calculateBusinessDate({})).rejects.toThrow();
  });

  it("suma 1 hora hábil correctamente", async () => {
    const service = new BusinessDateService();
    const result = await service.calculateBusinessDate({
      hours: 1,
      date: "2025-10-31T22:00:00.000Z",
    });
    expect(result).toBe("2025-11-04T14:00:00Z");
  });

  it("suma 1 día hábil + 4 horas correctamente", async () => {
    const service = new BusinessDateService();
    const result = await service.calculateBusinessDate({
      days: 1,
      hours: 4,
      date: "2025-10-28T20:00:00.000Z",
    });
    expect(result).toBe("2025-10-30T15:00:00Z");
  });

  it("suma 8 horas hábiles correctamente", async () => {
    const service = new BusinessDateService();
    const result = await service.calculateBusinessDate({
      hours: 8,
      date: "2025-10-28T13:00:00.000Z",
    });
    expect(result).toBe("2025-10-28T22:00:00Z");
  });
});
