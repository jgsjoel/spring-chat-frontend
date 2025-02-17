import { useEffect, useState } from "react";
import { Stomp, CompatClient } from "@stomp/stompjs";

let client: CompatClient;

export default function TestComponent() {
  const [message, setMessage] = useState("");
  const [receivedMessages, setReceivedMessages] = useState<string[]>([]);

  useEffect(() => {
    const connectWebSocket = () => {
      const socket = new WebSocket("ws://localhost:8080/ws");
      client = Stomp.over(socket);

      client.connect({}, () => {
        console.log("Connected to WebSocket");

        // Subscribe to a topic
        client.subscribe("/topic/room/123", (message) => {
          setReceivedMessages((prev) => [...prev, message.body]);
        });
      });
    };

    connectWebSocket();

    // Cleanup on component unmount
    return () => {
      if (client) {
        client.disconnect(() => console.log("Disconnected from WebSocket"));
      }
    };
  }, []);

  const sendMessage = () => {
    if (client && client.connected && message.trim()) {
      client.send("/app/sendMessage/123", {}, JSON.stringify({ message }));
      console.log("Message sent:", message);
      setMessage(""); // Clear input after sending
    } else {
      console.warn("Client not connected or empty message.");
    }
  };

  return (
    <div className="flex h-screen justify-center items-center">
      <div className="border border-black p-3">
        <input
          className="border border-black p-2 w-full"
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message"
        />
        <button
          className="bg-blue-400 p-3 mt-2 rounded text-white w-full"
          onClick={sendMessage}
        >
          Send Message
        </button>

        <div className="mt-4">
          <h2>Received Messages:</h2>
          <ul>
            {receivedMessages.map((msg, index) => (
              <li key={index}>{msg}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
