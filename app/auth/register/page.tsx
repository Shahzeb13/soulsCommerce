"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

import Image from "next/image";
export default function RegisterPage() {
    const router = useRouter(); 
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);


async function handleSubmit(e: React.FormEvent) {
  e.preventDefault();
  setError("");

  if (password.length < 8) {
    setError("Password must be at least 8 characters.");
    return;
  }

  setLoading(true);
  try {
    await axios.post(
      "/api/auth/register",
      { username, email, password },
      { timeout: 10000 } // stop waiting after 10 seconds
    );

    router.push("/auth/login");
  } catch (err) {
    if (axios.isAxiosError<{ message?: string }>(err)) {
      if (err.response) {
        // Layer 1: the server answered, but with an error status
        const status = err.response.status;
        const serverMessage = err.response.data?.message;

        if (status === 400 || status === 422) {
          setError(serverMessage || "Please check your details.");
        } else if (status === 409) {
          setError(serverMessage || "This email or username is already used.");
        } else if (status === 429) {
          setError("Too many attempts. Please wait and try again.");
        } else if (status >= 500) {
          setError("Server problem. Please try again later.");
        } else {
          setError(serverMessage || `Request failed (${status}).`);
        }
      } else if (err.request) {
        // Layer 2: the request was sent, but no response came back
        if (err.code === "ECONNABORTED") {
          setError("The server took too long to respond. Try again.");
        } else {
          setError("Cannot reach the server. Check your internet.");
        }
      } else {
        // Layer 3: the request could not even be created
        setError("Could not send the request. Please try again.");
      }
    } else {
      // Not an axios error at all (a normal bug in your code)
      console.error(err);
      setError("Something unexpected happened.");
    }
  } finally {
    setLoading(false);
  }
}

  return (
    <div className="flex flex-row w-full h-screen">
      <div className="flex-1 flex items-center justify-center">
        <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="w-full rounded-lg border border-gray-300 px-4 py-2 outline-none focus:border-black"
          />

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full rounded-lg border border-gray-300 px-4 py-2 outline-none focus:border-black"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            className="w-full rounded-lg border border-gray-300 px-4 py-2 outline-none focus:border-black"
          />

          <button
            type="submit"
            className="w-full rounded-lg bg-black py-2 font-semibold text-white hover:bg-gray-800"
          >
            Register
          </button>
        </form>
      </div>
      <div className=" flex-1 p-1">
        <div className=" relative  w-full h-full rounded-2xl shadow-2xl">
          <Image
            src="/assets/Register/cozy.jpg"
            alt="Cheese pizza"
            fill
            className="object-cover"
          />
        </div>
      </div>
    </div>
  );
}
