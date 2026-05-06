export function getClientSessionId(): string {
  if (typeof window === "undefined") return "";
  let sid = window.localStorage.getItem("kagami.sessionId");
  if (!sid) {
    sid = typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    window.localStorage.setItem("kagami.sessionId", sid);
  }
  return sid;
}
