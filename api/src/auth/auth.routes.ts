import { Router } from "express";

import { SESSION_COOKIE_NAME, sessionCookieOptions } from "./cookie";
import { credentials } from "./credentials";
import { createSession } from "./session-store";

export const authRoutes = Router();

authRoutes.post("/login", (req, res) => {
	const { username, password } = req.body;

	if (!username || !password) {
		return res.status(401).json({ error: "Username and password required" });
	}

	if (username !== credentials.username || password !== credentials.password) {
		return res.status(401).json({ error: "Invalid credentials" });
	}

	const sessionId = createSession(username);

	res.cookie(SESSION_COOKIE_NAME, sessionId, sessionCookieOptions);

	return res.status(204).end();
});
