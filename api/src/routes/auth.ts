import { Router } from "express";

const router = Router();

router.post("/register", (_req, res) => {
  res.json({ success: true, message: "Register route works" });
});

router.post("/login", (_req, res) => {
  res.json({ success: true, message: "Login route works" });
});

router.post("/logout", (_req, res) => {
  res.json({ success: true, message: "Logout route works" });
});

router.get("/me", (_req, res) => {
  res.json({ success: true, message: "Me route works" });
});

export default router;
