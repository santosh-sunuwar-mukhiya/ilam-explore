import { route } from "express"
import {upload} from "../middlewares/multer.middleware.js"
import { registerUser, loginUser, logoutUser } from "../controllers/auth.controller.js"
import {protect} from "../middlewares/auth.middleware.js"

const router = route()

router.route("/register").post(
    upload.single("avatar"),
    registerUser
)

router.route("/login").post(loginUser);

// secured routes
router.route("/logout").post(protect, logoutUser)