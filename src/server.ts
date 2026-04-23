import express from "express";
import { createSession } from "./auth/session-store";

const app = express();
const port = 3000;

app.use(express.json());
app.use(express.static("public"));

const credentials = {
	username: "dev",
	password: "123",
};

app.post("/login", (req, res) => {
	const { username, password } = req.body;

	if (username !== credentials.username || password !== credentials.password) {
		return res.status(401).json({ error: "Credenciais inválidas" });
	}

	const sessionId = createSession(username);
	console.log(sessionId);

	res.setHeader("Set-Cookie", `session_id=${sessionId}; Path=/; Max-Age=3600;`);

	res.status(204).end();
});

app.listen(port, () => {
	console.log(`Server running on http://localhost:${port}`);
});
