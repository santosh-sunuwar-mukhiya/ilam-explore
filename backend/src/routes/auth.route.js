import { route } from "express"
import {upload} from "../middlewares/multer.middleware.js"
import {registerUser} from "../controllers/auth.controller.js"

const router = route()

router.route("/register").post(
    upload.single("avatar"),
    registerUser
)