import { Router } from "express";
import captainAuthenticate from "../middleware/captainAuth.middleware.js";
import captainLocationUpdate from "../controller/captainLocationUpdate.controller.js";
import userAuthenticate from "../middleware/userAuth.middleware.js";
import userLocationUpdate from "../controller/userLocationUpdate.controller.js";

const router = Router();

router.post("/captain", captainAuthenticate, captainLocationUpdate);
router.post("/user", userAuthenticate, userLocationUpdate);

export default router;