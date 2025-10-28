import { describe, it, expect } from "vitest";
import { BusinessDateService } from "../domain/services/businessDate.service";

describe("BusinessDateService", () => {
  it("debería lanzar si no se proporcionan parámetros", async () => {
    const service = new BusinessDateService();
    await expect(service.calculateBusinessDate({})).rejects.toThrow();
  });
});
