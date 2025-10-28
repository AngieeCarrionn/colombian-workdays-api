import request from "supertest";
import express from "express";
import businessDateRouter from "../routes/businessDate.routes";

const app = express();
app.use(express.json());
app.use("/api/business-date", businessDateRouter);

describe("BusinessDateController", () => {
  it("debe devolver 400 si faltan los parámetros", async () => {
    const res = await request(app).get("/api/business-date");
    expect(res.status).toBe(400);
  });
});
