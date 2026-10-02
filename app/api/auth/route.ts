import { NextResponse } from "next/server";
// import bcrypt from "bcryptjs";
// import { connectDB } from "@/lib/mongodb";

import { connectDB } from "@/Database/db";
import User from "@/models/user.model";

export async function POST(req: Request) {
  try {
    const { username, email, password } = await req.json();

    // 1. Check the data (never trust the frontend)
    if (!username || !email || !password) {
      return NextResponse.json(
        { message: "All fields are required." },
        { status: 400 }
      );
    }
    if (username.trim().length < 3) {
      return NextResponse.json(
        { message: "Username must be at least 3 characters." },
        { status: 400 }
      );
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      return NextResponse.json(
        { message: "Please enter a valid email." },
        { status: 400 }
      );
    }
    if (password.length < 8) {
      return NextResponse.json(
        { message: "Password must be at least 8 characters." },
        { status: 400 }
      );
    }

    await connectDB();

    // 2. Check if the user already exists
    const existing = await User.findOne({
      $or: [
        { email: email.toLowerCase().trim() },
        { username: username.trim() },
      ],
    });
    if (existing) {
      return NextResponse.json(
        { message: "Email or username is already used." },
        { status: 409 }
      );
    }

    // 3. Hash the password and save
    const hashedPassword = await bcrypt.hash(password, 10);
    await User.create({
      username: username.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
    });

    return NextResponse.json(
      { message: "Account created successfully." },
      { status: 201 }
    );
  } catch (error: unknown) {
    // Safety net: two requests at the same time can pass step 2
    // together, then MongoDB blocks the duplicate with code 11000.
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code?: number }).code === 11000
    ) {
      return NextResponse.json(
        { message: "Email or username is already used." },
        { status: 409 }
      );
    }

    console.error("Register error:", error);
    return NextResponse.json(
      { message: "Server error. Please try again later." },
      { status: 500 }
    );
  }
}