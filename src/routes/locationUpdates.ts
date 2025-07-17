import { Router } from "express";
import captainAuthenticate from "../middleware/captainAuth.js";
import captainLocationUpdate from "../controller/captainLocationUpdate.js";
import userAuthenticate from "../middleware/userAuth.js";
import userLocationUpdate from "../controller/userLocationUpdate.js";

const router = Router();

router.post("/captain", captainAuthenticate, captainLocationUpdate);
router.post("/user", userAuthenticate, userLocationUpdate);

export default router;