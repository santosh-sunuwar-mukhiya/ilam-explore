import express from "express"

const router = express.Router();

router.patch("/profile", updateProfile);

router.get("/", listUsers);

export default router;