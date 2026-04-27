import express from "express";
// import { authMiddleware } from "./auth/auth.middleware";
import { authRoutes } from "./auth/auth.routes";

export const app = express();

app.use(express.json());
app.use(express.static("public"));

app.use(authRoutes);

const port = 3000;

app.listen(port, () => {
	console.log(`Server running on http://localhost:${port}`);
});
