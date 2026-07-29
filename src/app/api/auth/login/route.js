import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { signSessionToken, setSessionCookies } from "@/lib/auth";

// A real bcrypt hash of a fixed, unguessable string -- never any user's
// actual hash. Used only when no account matches the email, so
// bcrypt.compare() still does a full round of work either way and a
// nonexistent email can't be detected by a faster response time.
const DUMMY_HASH = "$2b$12$2Dvka4nx281Za2/geW/qyO2L5a89IkJZernJhTyDZfFzxNgY2kQVO";

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const email = String(body.email || "").trim().toLowerCase();
  const password = String(body.password || "");

  if (!email || !password) {
    return NextResponse.json(
      { error: "Email and password are required" },
      { status: 400 },
    );
  }

  try {
    await dbConnect();

    const user = await User.findOne({ email });
    const valid = await bcrypt.compare(password, user?.passwordHash || DUMMY_HASH);

    if (!user || !valid) {
      // Same message either way -- don't reveal which part was wrong.
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    const token = await signSessionToken({ userId: user._id.toString() });
    await setSessionCookies(token, user.darkMode);

    return NextResponse.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profileImageUrl: user.profileImageUrl,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    return NextResponse.json(
      { error: "Something went wrong logging in. Check the server terminal for details." },
      { status: 500 },
    );
  }
}
