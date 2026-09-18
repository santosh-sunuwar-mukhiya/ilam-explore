import express from "express"
import {updateProfile} from "../controllers/user.controller.js"

const router = express.Router();

router.patch("/profile", updateProfile);

router.get("/", listUsers);

export default router;