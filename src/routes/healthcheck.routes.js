import { Router } from "express";
import { healthCheck } from "../controllers/healthcheck.controller.js";


const healthRoute = Router();

// healthRoute.route('/').get(healthCheck)
healthRoute.get('/',healthCheck)


export default healthRoute