// ChatPage.tsx
"use client";
import { useEffect, useRef, useState } from "react";
import { jwtDecode } from "jwt-decode";
import AudioRecorder from "@/components/AudioRecorder";
import { pusherClient } from "@/lib/pusherClient";
import { getChatRoomId } from "@/lib/chat";
import { useParams } from "next/navigation";

interface Message {
  id?: string;
  senderId: string;
  recipientId: string;
  content?: string;
  audioUrl?: string;
  type: string;
  createdAt : string;
  chatRoomId: string;
}

interface User {
  id: string;
  name: string;
}

// No need for ChatPageProps with useParams hook


const VOICE_API_URL = "https://voice-translation-api-production-0844.up.railway.app/api/voice";

function getUserFromToken(): User | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/token=([^;]+)/);
  if (!match) return null;
  try {
    const user = jwtDecode<User>(decodeURIComponent(match[1]));
    return user;
  } catch {
    return null;
  }
}

export default function ChatPage() {
  const params = useParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [language, setLanguage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const user = getUserFromToken();
  const chatId = params.chatId as string;
  const recipientId = user ? chatId.split('-').filter(id => id !== user.name)[0] : "";
  const roomId = user && recipientId ? getChatRoomId(user.name, recipientId) : "";

  useEffect(() => {
    if (!user || !recipientId) return;
  
    fetch(`/api/users/language/?userId=${recipientId}`)
      .then(res => res.json())
      .then(data => setLanguage(data.preferred_language || "en"))
      .catch(err => {
        console.error("Failed to fetch language:", err);
        setLanguage("en"); 
      });
  }, [user, recipientId]);

  useEffect(() => {
    if (!roomId || !recipientId) return;
    fetch(`/api/messages/${recipientId}`)
      .then(res => res.json())
      .then(data => {
        const filtered = data.messages.filter((msg: Message) => msg.chatRoomId === roomId);
        setMessages(filtered);
      });

    const channel = pusherClient.subscribe(`chat-${roomId}`);
    const handleNewMessage = (message: Message) => {
      setMessages(prev => [...prev, message]);
    };
    channel.bind("new-message", handleNewMessage);
    return () => {
      channel.unbind("new-message", handleNewMessage);
      pusherClient.unsubscribe(`chat-${roomId}`);
    };
  }, [roomId, recipientId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  

  const sendMessage = async () => {
    if (!input.trim() || !user) return;
    const res = await fetch(`/api/messages/${roomId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chatId: roomId,
        recipient: recipientId,
        content: input,
        audioUrl: null,
        type: "text"
      }),
    });
    if (res.ok) setInput("");
  };

  // const handleNewVoiceMessage = (message: Message) => {
  //   setMessages(prev => [...prev, message]);
  // };

  if (!user) return <div>User not authenticated!!</div>;
  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <header className="p-4 bg-blue-600 text-white font-bold text-lg">Chat Room: {roomId}</header>
      <main className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4">
  
          {messages.map((msg) => (
            <div key={msg.id} className={`flex flex-col ${msg.senderId === user.name ? "items-end" : "items-start"}`}>
              <div className="bg-white rounded-lg px-4 py-2 shadow max-w-xs w-full">
                {msg.type === "voice" && msg.audioUrl ? (
                  <audio className="w-full mb-2 rounded-lg shadow-sm" controls src={msg.audioUrl} />
                ) : null}
                {msg.content && msg.content.trim() !== "" ? (
                  <div className="text-gray-800">{msg.content}</div>
                ) : null}
              </div>
              <div className="text-xs text-gray-400 mt-1">
                {msg.senderId === user.name ? "You" : msg.senderId} • {new Date(msg.createdAt).toLocaleTimeString()}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </main>
      <footer className="p-4 bg-white border-t flex items-center gap-2">
        <input
          type="text"
          className="flex-1 border rounded px-3 py-2 focus:outline-none focus:ring"
          placeholder="Type your message..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter") sendMessage(); }}
        />
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          onClick={sendMessage}
        >
          Send
        </button>
        <AudioRecorder
          // onAudioSent={handleNewVoiceMessage}
          apiUrl={VOICE_API_URL}
          language={language}
          senderId = {user.name}
          recipientId= {recipientId}
          chatRoomId = {roomId}
        />
      </footer>
    </div>
  );
}