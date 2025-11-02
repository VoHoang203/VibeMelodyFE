import { useState } from "react";
import { Send, Smile, Paperclip, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const mockChats = [
  {
    id: 0,
    name: "Gemini AI",
    avatar: "/ai-assistant-robot.jpg",
    lastMessage: "How can I help you today?",
    time: "now",
    online: true,
    isAI: true,
  },
  {
    id: 1,
    name: "As a Programmer",
    avatar: "/programmer.png",
    lastMessage: "Hey, check out this track!",
    time: "2m ago",
    online: true,
  },
  {
    id: 2,
    name: "Tania Star",
    avatar: "/young-woman-smiling.png",
    lastMessage: "Love your new album!",
    time: "1h ago",
    online: true,
  },
  {
    id: 3,
    name: "Music Lover",
    avatar: "/placeholder.svg?height=40&width=40",
    lastMessage: "When is the next release?",
    time: "3h ago",
    online: false,
  },
];

const presetQuestions = [
  "What are the trending music genres right now?",
  "How can I promote my music on VibeMelody?",
  "Tips for creating a successful album",
  "How to grow my fanbase?",
];

const mockMessages = [
  {
    id: 1,
    sender: "As a Programmer",
    message: "Hey! Have you heard the new track?",
    time: "10:30 AM",
    isMe: false,
  },
  {
    id: 2,
    sender: "Me",
    message: "Not yet! Is it good?",
    time: "10:32 AM",
    isMe: true,
  },
  {
    id: 3,
    sender: "As a Programmer",
    message: "Amazing! You should check it out",
    time: "10:33 AM",
    isMe: false,
  },
];

export default function ChatPage() {
  const [message, setMessage] = useState("");
  const [selectedChat, setSelectedChat] = useState(mockChats[0]);
  const [aiMessages, setAiMessages] = useState([]);

  const handlePresetQuestion = (question) => {
    setMessage(question);
  };

  const handleSendMessage = () => {
    if (!message.trim()) return;

    const newMessage = {
      id: Date.now(),
      sender: "Me",
      message: message,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      isMe: true,
    };

    setAiMessages([...aiMessages, newMessage]);
    setMessage("");

    // Simulate AI response
    setTimeout(() => {
      const aiResponse = {
        id: Date.now() + 1,
        sender: "Gemini AI",
        message:
          "I'm here to help! This is a demo response. In production, this would connect to a real AI service.",
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        isMe: false,
      };
      setAiMessages((prev) => [...prev, aiResponse]);
    }, 1000);
  };

  return (
    <div className="flex h-[calc(100vh-6rem)]">
      {/* Chat List */}
      <div className="w-80 border-r border-white/10 flex flex-col">
        <div className="p-4 border-b border-white/10">
          <h2 className="text-xl font-bold">Messages</h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {mockChats.map((chat) => (
            <button
              key={chat.id}
              onClick={() => setSelectedChat(chat)}
              className={`w-full flex items-center gap-3 p-4 hover:bg-white/5 transition ${
                selectedChat.id === chat.id ? "bg-white/10" : ""
              }`}
            >
              <div className="relative">
                <img
                  src={chat.avatar || "/placeholder.svg"}
                  alt={chat.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                {chat.online && (
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-black"></div>
                )}
                {chat.isAI && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                    <Sparkles className="h-3 w-3 text-black" />
                  </div>
                )}
              </div>
              <div className="flex-1 text-left min-w-0">
                <p className="font-medium text-white truncate">{chat.name}</p>
                <p className="text-sm text-gray-400 truncate">
                  {chat.lastMessage}
                </p>
              </div>
              <span className="text-xs text-gray-500">{chat.time}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="p-4 border-b border-white/10 flex items-center gap-3">
          <div className="relative">
            <img
              src={selectedChat.avatar || "/placeholder.svg"}
              alt={selectedChat.name}
              className="w-10 h-10 rounded-full object-cover"
            />
            {selectedChat.isAI && (
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                <Sparkles className="h-3 w-3 text-black" />
              </div>
            )}
          </div>
          <div>
            <p className="font-medium text-white">{selectedChat.name}</p>
            <p className="text-xs text-gray-400">
              {selectedChat.online ? "Online" : "Offline"}
            </p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {selectedChat.isAI && aiMessages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full space-y-6">
              <div className="text-center space-y-2">
                <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto">
                  <Sparkles className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-white">
                  Chat with Gemini AI
                </h3>
                <p className="text-gray-400">
                  Ask me anything about music, VibeMelody, or get
                  recommendations!
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 max-w-2xl">
                {presetQuestions.map((question, index) => (
                  <button
                    key={index}
                    onClick={() => handlePresetQuestion(question)}
                    className="p-4 bg-white/5 hover:bg-white/10 rounded-xl text-left transition border border-white/10 hover:border-primary/50"
                  >
                    <p className="text-sm text-white">{question}</p>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {(selectedChat.isAI ? aiMessages : mockMessages).map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${
                    msg.isMe ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-md px-4 py-2 rounded-2xl ${
                      msg.isMe
                        ? "bg-primary text-black"
                        : "bg-white/10 text-white"
                    }`}
                  >
                    <p className="text-sm">{msg.message}</p>
                    <p
                      className={`text-xs mt-1 ${
                        msg.isMe ? "text-black/60" : "text-gray-400"
                      }`}
                    >
                      {msg.time}
                    </p>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>

        {/* Message Input */}
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-2">
            <button className="text-gray-400 hover:text-white transition p-2">
              <Paperclip className="h-5 w-5" />
            </button>
            <Input
              type="text"
              placeholder="Type a message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) =>
                e.key === "Enter" && selectedChat.isAI && handleSendMessage()
              }
              className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-gray-400"
            />
            <button className="text-gray-400 hover:text-white transition p-2">
              <Smile className="h-5 w-5" />
            </button>
            <Button
              size="icon"
              className="bg-primary hover:bg-primary/90"
              onClick={selectedChat.isAI ? handleSendMessage : undefined}
            >
              <Send className="h-5 w-5 text-black" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
