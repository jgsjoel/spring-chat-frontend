import { FiPaperclip, FiSend } from "react-icons/fi";
import { useEffect, useRef, useState } from "react";
import { useWebSocket } from "../providers/SocketProvider";
import api from "../config/axios_config";
import "../custom.css";
import { useAuth } from "../providers/AuthProvider";
import EmojiPicker from "./EmojiPicker";
import { useGlobalContext } from "../providers/GlobalProvider";

type Message = {
  sender: string;
  sender_token: string;
  message: string;
  file_url: string;
  localDateTime: string;
};

export default function ChatSection() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const { client, userToken } = useWebSocket();
  const { selectedChannel, setSelectedChannel } = useGlobalContext();
  const { authToken } = useAuth();
  const [showPicker, setShowPicker] = useState(false);
  const { selectedChat } = useGlobalContext();
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null); // State to store the preview
  const [enlargedImage, setEnlargedImage] = useState<string | null>(null); // State for enlarged image

  const handleEmojiSelect = (emoji: any) => {
    setNewMessage((prev) => prev + emoji.native);
    setShowPicker(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      // Create a preview URL for the file
      const filePreviewUrl = URL.createObjectURL(selectedFile);
      setFilePreview(filePreviewUrl); // Store the preview URL
    }
  };

  const handleRemovePreview = () => {
    setFile(null);
    setFilePreview(null);
  };

  const handleSendFile = async () => {
    if (file && selectedChannel) {
      const formData = new FormData();
      formData.append("file", file);

      try {
        const response = await api.post(`/messages/upload`, formData, {
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "multipart/form-data",
          },
        });

        if (response.status === 201) {
          console.log(response.data["file_url"]);
          saveMessage(response.data["file_url"]);
        }
      } catch (error) {
        console.error(error);
      }
    } else {
      saveMessage("");
    }
  };

  const saveMessage = (fileUrl: string | null) => {
    client?.publish({
      destination: `/app/message/${selectedChannel}`,
      body: JSON.stringify({
        sender: selectedChat?.username,
        sender_token: userToken,
        file_url: fileUrl,
        message: newMessage,
      }),
    });
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    async function loadChatWithUser() {
      if (!selectedChat) return;

      try {
        const response = await api.get(`/messages/${selectedChat.token}`, {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        });

        setMessages(response.data["message_list"]);
        setSelectedChannel(response.data["channel_token"]);
      } catch (error) {
        console.log(error);
      }
    }

    loadChatWithUser();
  }, [selectedChat, authToken]);

  useEffect(() => {
    if (selectedChannel && client) {
      const subscription = client.subscribe(`/topic/channel/${selectedChannel}`, (message) => {
        const newMsg: Message = JSON.parse(message.body);
        console.log("file: " + newMsg.file_url);
        setMessages((prevMessages) => [...prevMessages, newMsg]);
        scrollToBottom();
      });

      return () => subscription.unsubscribe();
    }
  }, [selectedChannel, client]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleImageClick = (url: string) => {
    setEnlargedImage(url);
  };

  const closeEnlargedImage = () => {
    setEnlargedImage(null);
  };

  return (
    <div className="w-2/3 flex flex-col h-full">
      {selectedChat ? (
        <>
          <div className="py-4 px-3 flex w-full items-center border-b border-b-gray-500">
            <div className="bg-blue-500 text-white w-10 h-10 flex items-center justify-center rounded-full mr-4">
              {selectedChat.username.charAt(0)}
            </div>
            <p className="text-white">{selectedChat.username}</p>
          </div>
          <div className="flex-grow p-4 overflow-y-auto no-scrollbar custom-scrollbar">
            {messages.length === 0 ? (
              <div className="text-center justify-center items-end text-gray-500">No messages</div>
            ) : (
              messages.map((msg, index) => (
                <div
                  key={index}
                  className={`mb-4 ${msg.sender_token === userToken ? "text-right" : "text-left"}`}
                >
                  <p className="text-sm text-gray-200 font-light">
                    {msg.sender_token === userToken ? "You" : msg.sender}
                  </p>
                  <div
                    className={`inline-block px-4 py-2 rounded-lg ${msg.sender_token === userToken ? "bg-green-100" : "bg-gray-200"}`}
                  >
                    
                    {msg.file_url && (
                      <div className="mt-2 mb-2">
                        {msg.file_url.endsWith(".jpg") || msg.file_url.endsWith(".png") || msg.file_url.endsWith(".jpeg") ? (
                          <img
                            src={`http://localhost:8080/api/v1/messages/files/${msg.file_url}`}
                            alt="Attached File"
                            className="w-24 mb-2 cursor-pointer"
                            onClick={() => handleImageClick(`http://localhost:8080/api/v1/messages/files/${msg.file_url}`)} // Click to enlarge
                          />
                        ) : (
                          
                          <a href={msg.file_url} className="text-blue-500" download>
                            Download Attached File
                          </a>
                        )}
                      </div>
                    )}
                    <p className="text-sm text-gray-800">{msg.message}</p>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{msg.localDateTime}</p>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="border-t border-gray-500 p-2 flex items-center relative">
            {/* File Preview */}
            {filePreview && (
              <div className="flex items-center mr-2 bg-gray-800 p-2 rounded-lg">
                <img src={filePreview} alt="file preview" className="w-12 h-12 object-cover rounded-lg" />
                <button onClick={handleRemovePreview} className="ml-2 text-white">X</button>
              </div>
            )}

            <input
              type="text"
              className={`flex-1 px-4 text-white py-2 border border-white focus:border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 ${filePreview ? 'pr-12' : ''}`}
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
            />
            <button onClick={() => setShowPicker(!showPicker)} className="ml-2">
              😊
            </button>
            {/* File upload button */}
            <input
              type="file"
              accept=".jpg,.jpeg,.png,.pdf,.txt,.docx"
              onChange={handleFileChange}
              id="file-input"
              className="hidden"
            />

            <label htmlFor="file-input" className="cursor-pointer">
              <FiPaperclip size={24} className="text-white" />
            </label>
            {showPicker && (
              <div className="absolute bottom-12 right-2 z-10">
                <EmojiPicker onSelectEmoji={handleEmojiSelect} />
              </div>
            )}
            <button onClick={handleSendFile} className="ml-2 bg-green-600 text-white p-2 rounded-full hover:bg-green-700">
              <FiSend size={20} />
            </button>
          </div>

          {/* Modal for enlarged image */}
          {enlargedImage && (
            <div
              className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50"
              onClick={closeEnlargedImage}
            >
              <img src={enlargedImage} alt="Enlarged File" className="max-w-full max-h-full object-contain" />
            </div>
          )}
        </>
      ) : (
        <div className="flex items-center justify-center h-full text-gray-500">
          Select a user to start chatting.
        </div>
      )}
    </div>
  );
}
