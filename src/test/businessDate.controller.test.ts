/**
 * Tests de integración para el endpoint de fechas hábiles.
 *
 * Verifica:
 * 1. Validación de parámetros
 * 2. Cálculo correcto de fechas hábiles
 * 3. Manejo de errores
 *
 * @group Integration
 * @group BusinessDate
 */

import { describe, it, expect } from "vitest";
import request from "supertest";
import { app } from "../app"; //Usa el app real que ya tiene router y middleware configurados

describe("BusinessDateController", () => {
    describe("Validación de parámetros", () => {
        it("debe devolver 400 si faltan los parámetros", async () => {
            const res = await request(app).get("/api/business-date?");
            expect(res.status).toBe(400);
            expect(res.body).toMatchObject({
                error: "InvalidParameters",
                message: expect.any(String),
            });
        });

        it("debe devolver 400 si hours es negativo", async () => {
            const res = await request(app).get("/api/business-date?hours=-3");
            expect(res.status).toBe(400);
            expect(res.body).toMatchObject({
                error: "InvalidParameters",
                message: expect.any(String),
            });
        });

        it("debe devolver 400 si days es negativo", async () => {
            const res = await request(app).get("/api/business-date?days=-2");
            expect(res.status).toBe(400);
            expect(res.body).toMatchObject({
                error: "InvalidParameters",
                message: expect.any(String),
            });
        });

        it("debe devolver 400 si la fecha es inválida", async () => {
            const res = await request(app).get("/api/business-date?date=abc&hours=2");
            expect(res.status).toBe(400);
            expect(res.body).toMatchObject({
                error: "InvalidParameters",
                message: expect.any(String),
            });
        });
    });

    describe("Cálculo de fechas", () => {
        it("suma 1 hora hábil después del viernes 17:00 COL → lunes o martes si festivo", async () => {
            const res = await request(app).get(
                "/api/business-date?hours=1&date=2025-10-31T22:00:00.000Z"
            );
            expect(res.status).toBe(200);
            expect(res.body).toMatchObject({
                date: "2025-11-04T14:00:00Z",
            });
        });

        it("suma 1 día hábil + 4 horas", async () => {
            const res = await request(app).get(
                "/api/business-date?days=1&hours=4&date=2025-10-28T20:00:00.000Z"
            );
            expect(res.status).toBe(200);
            expect(res.body).toMatchObject({
                date: "2025-10-30T15:00:00Z",
            });
        });

        it("suma 8 horas hábiles desde martes 13:00 COL", async () => {
            const res = await request(app).get(
                "/api/business-date?hours=8&date=2025-10-28T13:00:00.000Z"
            );
            expect(res.status).toBe(200);
            expect(res.body).toMatchObject({
                date: "2025-10-28T22:00:00Z",
            });
        });
    });
});