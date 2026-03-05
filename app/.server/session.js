import { createCookieSessionStorage } from "react-router";

let { getSession, commitSession, destroySession } = createCookieSessionStorage({
  cookie: {
    name: "__session",
    httpOnly: true,
    maxAge: 60 * 60 * 24,
    path: "/",
    sameSite: "lax",
    secrets: ["s3cret1"],
    secure: true,
  },
});
export function setSuccessMessage(session, message) {
  session.flash("toastMessage", { message, type: "success" });
}

export function setErrorMessage(session, message) {
  session.flash("toastMessage", { message, type: "error" });
}
export { getSession, commitSession, destroySession };
