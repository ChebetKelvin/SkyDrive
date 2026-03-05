import { redirect } from "react-router";
import { getSession, destroySession } from "../.server/session.js";

export async function action({ request }) {
  let session = await getSession(request.headers.get("Cookie"));

  return redirect("/", {
    headers: {
      "Set-Cookie": await destroySession(session),
    },
  });
}

export async function loader() {
  return redirect("/");
}

export default function Logout() {
  return null;
}
