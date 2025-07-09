"use client";
import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import Link from "next/link";

interface User {
  id: string;
  name: string;
}

interface DummyUser {
  name: string;
  preferred_language: string;
}

function getUserFromToken() {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/token=([^;]+)/);
  if (!match) return null;
  try {
    return jwtDecode<User>(decodeURIComponent(match[1]));
  } catch {
    return null;
  }

}

export default function ChatSelectionPage() {
  const [users, setUsers] = useState<DummyUser[]>([]);
  const user = getUserFromToken();

  useEffect(()=>{
    fetch("/api/users")
    .then(res => res.json())
    .then(data => setUsers(data))
    .catch(err => console.error("Error loading users", err));
  },[]);

  if (!user) {
    return <div className="flex items-center justify-center h-screen text-xl">Not authenticated</div>;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <h1 className="text-3xl font-bold mb-8 mt-8">Select a Chat</h1>
      <div className="w-full max-w-md space-y-4">
        {users.filter(u => u.name !== user.name).map(u => (
          <Link
            key={u.name}
            href={`/chat/${u.name}`}
            className="block p-4 bg-white rounded-lg shadow hover:bg-blue-100 transition border border-gray-200"
          >
            <div className="flex items-center justify-between">
              <span className="text-lg font-medium">{u.name}</span>
              <span className="text-sm text-gray-500">{u.preferred_language.toUpperCase()}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
