import { Router } from "express";
import { getBusinessDate } from "../controllers/businessDate.controller";


const router = Router();

router.get("/", getBusinessDate);

export default router;
