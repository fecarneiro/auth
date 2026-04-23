const sessions = new Map();

export function createSession(username: string) {
	const sessionId = crypto.randomUUID();

	sessions.set(username, {
		session_id: sessionId,
	});

	return sessionId;
}
