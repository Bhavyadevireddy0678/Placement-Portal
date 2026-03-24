import { useState, useRef, useEffect } from "react";

const BACKEND_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function ChatBot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "bot",
      text: "Hi! I can help you with placement info, company details, and eligibility. What would you like to know?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage() {
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", text: userMsg }]);
    setLoading(true);

    try {
      const res = await fetch(`${BACKEND_URL}/api/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: userMsg }),
      });

      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        { role: "bot", text: data.answer },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "bot", text: "Server error. Try again." },
      ]);
    }

    setLoading(false);
  }

  return (
    <div style={{ position: "fixed", bottom: "24px", right: "24px", zIndex: 1000 }}>
      {open && (
        <div
          style={{
            width: "340px",
            height: "480px",
            background: "#fff",
            borderRadius: "16px",
            boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
            display: "flex",
            flexDirection: "column",
            marginBottom: "12px",
            overflow: "hidden",
            border: "1px solid #e5e7eb",
          }}
        >
          <div
            style={{
              background: "#4F46E5",
              color: "#fff",
              padding: "14px 16px",
              fontWeight: "600",
              fontSize: "15px",
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            Placement Assistant
            <button
              onClick={() => setOpen(false)}
              style={{
                background: "none",
                border: "none",
                color: "#fff",
                fontSize: "18px",
                cursor: "pointer",
              }}
            >
              ×
            </button>
          </div>

          <div style={{ flex: 1, overflowY: "auto", padding: "10px" }}>
            {messages.map((msg, i) => (
              <div
                key={i}
                style={{
                  textAlign: msg.role === "user" ? "right" : "left",
                  marginBottom: "8px",
                }}
              >
                <span
                  style={{
                    background: msg.role === "user" ? "#4F46E5" : "#eee",
                    color: msg.role === "user" ? "#fff" : "#000",
                    padding: "8px 10px",
                    borderRadius: "10px",
                    display: "inline-block",
                    maxWidth: "80%",
                  }}
                >
                  {msg.text}
                </span>
              </div>
            ))}
            {loading && <div>Thinking...</div>}
            <div ref={bottomRef}></div>
          </div>

          <div style={{ display: "flex", padding: "10px" }}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Ask about placements..."
              style={{
                flex: 1,
                padding: "8px",
                border: "1px solid #ccc",
                borderRadius: "6px",
              }}
            />
            <button
              onClick={sendMessage}
              style={{
                marginLeft: "8px",
                padding: "8px 12px",
                background: "#4F46E5",
                color: "#fff",
                border: "none",
                borderRadius: "6px",
              }}
            >
              Send
            </button>
          </div>
        </div>
      )}

      <button
        onClick={() => setOpen(!open)}
        style={{
          width: "55px",
          height: "55px",
          borderRadius: "50%",
          background: "#4F46E5",
          color: "#fff",
          border: "none",
          fontSize: "20px",
          cursor: "pointer",
        }}
      >
        💬
      </button>
    </div>
  );
}
