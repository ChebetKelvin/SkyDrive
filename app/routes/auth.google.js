// routes/auth/google.js
import {
  verifyIdToken,
  handleFirebaseUser,
} from "../.server/firebase.server.js";
import { commitSession } from "../.server/session.js";

export const action = async ({ request }) => {
  try {
    const { idToken } = await request.json();
    console.log("Received token length:", idToken.length);

    const { valid, user, error } = await verifyIdToken(idToken);
    if (!valid) return new Response(error, { status: 401 });

    const {
      success,
      session,
      dbUser,
      error: sessionError,
    } = await handleFirebaseUser(request, user);
    if (!success) return new Response(sessionError, { status: 500 });

    const redirectUrl = dbUser.role === "admin" ? "/admin" : "/dashboard";

    return new Response(null, {
      status: 302,
      headers: {
        Location: redirectUrl,
        "Set-Cookie": await commitSession(session),
      },
    });
  } catch (err) {
    console.error("Google auth failed:", err);
    return new Response("Authentication failed", { status: 500 });
  }
};
