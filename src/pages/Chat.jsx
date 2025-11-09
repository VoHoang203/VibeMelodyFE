import { useEffect, useState, useMemo } from "react";
import { Send, Smile, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useUserStore } from "../store/useUserStore";
import { useChatStore } from "../store/useChatStore";
import { api } from "../lib/api";
import ai from "@/assets/vbai.png";
import AiSongCards from "@/components/AiSongCards";

const presetQuestions = [
  // (1) Trò chuyện thường
  "Cho mình vài mẹo khám phá nhạc hay trên VibeMelody?",
  "Gợi ý playlist nghe buổi tối nhẹ nhàng được không?",

  // (2) Gợi ý 5 bài từ nghệ sĩ mình đang theo dõi
  "Gợi ý 5 bài mới từ nghệ sĩ mình theo dõi",
  "Cho mình 5 bài gần đây của các nghệ sĩ mình đang theo dõi",

  // (3) Mood qua tiêu đề bài/album (không cần category)
  "Mình buồn, gợi ý vài bài hợp mood buồn",
  "Mình vui, gợi ý vài bài nghe cho mood vui",
  "Mình mệt, gợi ý vài bài dễ nghe thư giãn",
  "Gợi ý bài chill dễ ngủ",
  "Cần vài bài giúp tập trung học bài",
];

export default function ChatPage() {
  const { user } = useUserStore();

  const {
    users,
    onlineUsers,
    messages,
    fetchUsers,
    fetchMessages,
    sendMessage,
    initSocket,
    setSelectedUser,
    selectedUser,
  } = useChatStore();

  const [message, setMessage] = useState("");
  const [aiMessages, setAiMessages] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);

  const isArtist = !!user?.isArtist;
  const currentUserId = user?._id || user?.id;

  // Khởi tạo socket + load danh sách users
  useEffect(() => {
    if (!currentUserId) return;
    initSocket(currentUserId);
    fetchUsers();
  }, [currentUserId, initSocket, fetchUsers]);

  // Build danh sách chat ở sidebar: Gemini AI + tất cả user khác
  const chatItems = useMemo(() => {
    const list = [];

    // Nếu là artist thì có Gemini AI ở đầu
    if (isArtist) {
      list.push({
        id: "ai",
        type: "ai",
        name: "VibeMelody AI",
        avatar: ai || "/ai-assistant-robot.jpg",
        lastMessage:
          aiMessages[aiMessages.length - 1]?.message ||
          "How can I help you today?",
        time: "now",
        online: true,
        isAI: true,
      });
    }

    // Các user khác từ BE
    (users || []).forEach((u) => {
      const uid = u._id || u.id;
      if (!uid) return;
      // Không hiển thị chính mình
      if (currentUserId && String(uid) === String(currentUserId)) return;

      const name = u.fullName || u.name || u.email || "User";
      const avatar = u.imageUrl || "/placeholder.svg";
      const isOnline =
        onlineUsers instanceof Set ? onlineUsers.has(String(uid)) : false;

      list.push({
        id: String(uid),
        type: "user",
        name,
        avatar,
        online: isOnline,
        isAI: false,
        raw: u,
        lastMessage: "",
        time: "",
      });
    });

    return list;
  }, [isArtist, users, onlineUsers, aiMessages, currentUserId]);

  // Khi lần đầu có chatItems mà chưa có selectedChat -> auto chọn item đầu
  useEffect(() => {
    if (selectedChat || chatItems.length === 0) return;
    const first = chatItems[0];
    setSelectedChat(first);
    if (first.type === "user" && first.raw) {
      setSelectedUser(first.raw);
    }
  }, [chatItems, selectedChat, setSelectedUser]);

  // Khi selectedUser trong store thay đổi -> fetch messages (user ↔ user)
  useEffect(() => {
    if (!selectedUser) return;
    const uid = selectedUser._id || selectedUser.id;
    if (!uid) return;
    fetchMessages(uid);
  }, [selectedUser, fetchMessages]);
useEffect(() => {
  if (!selectedChat || selectedChat.type !== "ai") return;

  let cancelled = false;
  (async () => {
    try {
      const res = await api.get("/ai/messages");
      const serverMessages = res.data?.data?.messages || [];

      if (cancelled) return;

      const mapped = serverMessages.map((msg) => ({
        id: msg._id,
        type: "text",
        message: msg.content,
        time: msg.createdAt
          ? new Date(msg.createdAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })
          : "",
        isMe: msg.senderId !== "ai", // 'ai' = bot
      }));

      setAiMessages(mapped);
    } catch (err) {
      console.error("❌ load AI messages error:", err);
    }
  })();

  return () => { cancelled = true; };
}, [selectedChat]);
  // Load lịch sử AI chat từ BE khi chọn tab Gemini AI
  useEffect(() => {
    if (!selectedChat || selectedChat.type !== "ai") return;

    let ignore = false;
    (async () => {
      try {
        const res = await api.post("/ai/chat", { message: text });
        const aiMsg = res.data?.data?.aiMessage;
        const songs = res.data?.data?.songs || [];

        if (aiMsg) {
          const mappedAi = {
            id: aiMsg._id,
            type: "text",
            message: aiMsg.content,
            time: aiMsg.createdAt
              ? new Date(aiMsg.createdAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "",
            isMe: false,
          };
          setAiMessages((prev) => [...prev, mappedAi]);

          if (songs.length) {
            const songMsg = {
              id: aiMsg._id + "_songs",
              type: "songs",
              songs, // mảng 5 bài đã map sẵn từ BE
              isMe: false,
            };
            setAiMessages((prev) => [...prev, songMsg]);
          }
        }
      } catch (err) {
        console.error("❌ load AI messages error:", err);
      }
    })();

    return () => {
      ignore = true;
    };
  }, [selectedChat]);

  // Messages hiển thị: nếu là AI -> dùng aiMessages; nếu là user -> map từ store.messages
  const displayMessages = useMemo(() => {
    if (!selectedChat) return [];

    if (selectedChat.type === "ai") {
      return aiMessages;
    }

    // user chat thực
    return (messages || []).map((msg) => {
      const senderId =
        msg.senderId || msg.sender?._id || msg.sender || msg.from;

      const isMe =
        currentUserId && senderId && String(senderId) === String(currentUserId);

      return {
        id: msg._id || msg.id,
        message: msg.content || msg.message || "",
        time: msg.createdAt
          ? new Date(msg.createdAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })
          : "",
        isMe,
      };
    });
  }, [selectedChat, aiMessages, messages, currentUserId]);

  const handlePresetQuestion = (question) => {
    setMessage(question);
  };

  const handleSendMessage = async () => {
    if (!message.trim() || !selectedChat) return;
    const text = message.trim();

    // Chat với Gemini AI
    if (selectedChat.type === "ai") {
      const now = new Date();
      const optimistic = {
        id: now.getTime(),
        type: "text",
        message: text,
        time: now.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        isMe: true,
      };

      // Hiển thị tin nhắn mình gửi ngay
      setAiMessages((prev) => [...prev, optimistic]);
      setMessage("");

      try {
        const res = await api.post("/ai/chat", { message: text });
        const aiMsg = res.data?.data?.aiMessage;

        if (aiMsg) {
          const mappedAi = {
            id: aiMsg._id,
            message: aiMsg.content,
            time: aiMsg.createdAt
              ? new Date(aiMsg.createdAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "",
            isMe: false,
          };

          setAiMessages((prev) => [...prev, mappedAi]);
        }
      } catch (err) {
        console.error("❌ send AI chat error:", err);
        // Có thể push 1 tin nhắn lỗi nhỏ nếu muốn
        setAiMessages((prev) => [
          ...prev,
          {
            id: Date.now() + 999,
            message: "Oops, AI đang lỗi chút xíu. Bạn thử gửi lại sau nhé 😅",
            time: new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
            isMe: false,
          },
        ]);
      }

      return;
    }

    // Chat user ↔ user qua socket
    if (!currentUserId || !selectedChat.id) return;
    sendMessage(selectedChat.id, currentUserId, text);
    setMessage("");
    // message_sent / receive_message từ socket sẽ tự push vào store.messages
  };

  if (!user) {
    return <div className="p-8">Bạn cần đăng nhập để dùng chat.</div>;
  }

  return (
    <div className="flex h-[calc(100vh-6rem)]">
      {/* Chat List */}
      <div className="w-80 border-r border-white/10 flex flex-col">
        <div className="p-4 border-b border-white/10">
          <h2 className="text-xl font-bold">Messages</h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {chatItems.map((chat) => (
            <button
              key={chat.id}
              onClick={() => {
                setSelectedChat(chat);
                if (chat.type === "user" && chat.raw) {
                  setSelectedUser(chat.raw);
                }
              }}
              className={`w-full flex items-center gap-3 p-4 hover:bg-white/5 transition ${
                selectedChat && selectedChat.id === chat.id ? "bg-white/10" : ""
              }`}
            >
              <div className="relative">
                <img
                  src={chat.avatar || "/placeholder.svg"}
                  alt={chat.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                {chat.type === "user" && chat.online && (
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-black"></div>
                )}
                {chat.type === "ai" && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                    <Sparkles className="h-3 w-3 text-black" />
                  </div>
                )}
              </div>
              <div className="flex-1 text-left min-w-0">
                <p className="font-medium text-white truncate">{chat.name}</p>
                <p className="text-sm text-gray-400 truncate">
                  {chat.lastMessage ||
                    (chat.type === "ai" ? "How can I help you today?" : "")}
                </p>
              </div>
              {chat.time && (
                <span className="text-xs text-gray-500">{chat.time}</span>
              )}
            </button>
          ))}
          {chatItems.length === 0 && (
            <p className="text-sm text-gray-400 p-4">
              Chưa có cuộc trò chuyện nào.
            </p>
          )}
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="p-4 border-b border-white/10 flex items-center gap-3">
          {selectedChat ? (
            <>
              <div className="relative">
                <img
                  src={selectedChat.avatar || "/placeholder.svg"}
                  alt={selectedChat.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                {selectedChat.type === "ai" && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                    <Sparkles className="h-3 w-3 text-black" />
                  </div>
                )}
              </div>
              <div>
                <p className="font-medium text-white">{selectedChat.name}</p>
                <p className="text-xs text-gray-400">
                  {selectedChat.type === "ai"
                    ? "Online"
                    : selectedChat.online
                    ? "Online"
                    : "Offline"}
                </p>
              </div>
            </>
          ) : (
            <p className="text-sm text-gray-400">
              Chọn một cuộc trò chuyện để bắt đầu.
            </p>
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {selectedChat &&
          selectedChat.type === "ai" &&
          aiMessages.length === 0 ? (
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
              {displayMessages.map((msg, idx) => {
                if (selectedChat?.type === "ai" && msg.type === "songs") {
                  return (
                    <div key={msg.id || idx} className="flex justify-start">
                      <div className="max-w-2xl w-full">
                        <AiSongCards songs={msg.songs} />
                      </div>
                    </div>
                  );
                }

                return (
                  <div
                    key={msg.id || idx}
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
                      {msg.time && (
                        <p
                          className={`text-xs mt-1 ${
                            msg.isMe ? "text-black/60" : "text-gray-400"
                          }`}
                        >
                          {msg.time}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
              {displayMessages.length === 0 && selectedChat && (
                <p className="text-sm text-gray-400 text-center mt-4">
                  Chưa có tin nhắn nào. Hãy bắt đầu cuộc trò chuyện!
                </p>
              )}
            </>
          )}
        </div>

        {/* Message Input */}
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-2">
            <Input
              type="text"
              placeholder="Type a message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSendMessage();
              }}
              className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-gray-400"
            />
            <Button
              size="icon"
              className="bg-primary hover:bg-primary/90"
              onClick={handleSendMessage}
              disabled={!selectedChat}
            >
              <Send className="h-5 w-5 text-black" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
