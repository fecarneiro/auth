import type { NextFunction, Request, Response } from "express";

export function authMiddleware(
	req: Request,
	res: Response,
	next: NextFunction,
) {
	const cookies = req.headers.cookie;

	// Parse cookies
	const sessionCookie = cookies
		?.split(";")
		.find((c) => c.startsWith("session_id="))
		?.trim()
		.split("=")[1]
		?.replace(/^['"]|['"]$/g, "");

	if (!sessionCookie) {
		res.statusCode = 401;
		res.status(401).send("Unauthorized: No Cookie");
	}

	// 2. Validate Token (Example: compare against memory store)
	if (isValidToken(token)) {
		next(); // User authenticated
	} else {
		res.statusCode = 403;
		res.end("Forbidden: Invalid Token");
	}
}
