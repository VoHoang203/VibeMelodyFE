import { useEffect, useRef } from "react";
import { useChatStore } from "../store/useChatStore";
import { useUserStore } from "../store/useUserStore";

/**
 * Provider không tạo context mới — chỉ chạy side-effects:
 * - Có userId => initSocket(userId) + fetchUsers()
 * - Cleanup/unmount hoặc userId đổi => disconnectSocket()
 * - Khi đổi selectedUser trong chat store => fetchMessages(selectedUser._id)
 */
export default function SocketProvider({ children }) {
  const initSocket = useChatStore((s) => s.initSocket);
  const disconnectSocket = useChatStore((s) => s.disconnectSocket);
  const fetchUsers = useChatStore((s) => s.fetchUsers);
  const fetchMessages = useChatStore((s) => s.fetchMessages);
  const selectedUserId = useChatStore(
    (s) => s.selectedUser?._id || s.selectedUser?.id || null
  );

  // Lấy userId từ store user
  const userId = useUserStore((s) => s.user?._id || s.user?.id || null);
  const initedForUserRef = useRef(null);
  // Connect khi có userId, disconnect khi đổi userId hoặc unmount
  useEffect(() => {
    if (!userId) return;

    // Nếu đã init cho cùng userId rồi -> bỏ qua
    if (initedForUserRef.current === userId) return;

    initedForUserRef.current = userId;
    initSocket(userId);
    fetchUsers();
    useChatStore.getState().fetchNotifications();
    // cleanup khi đổi userId hoặc unmount
    return () => {
      disconnectSocket();
      initedForUserRef.current = null;
    };
    // Chỉ phụ thuộc userId
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  useEffect(() => {
    if (!selectedUserId) return;
    fetchMessages(selectedUserId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedUserId]);

  return children;
}
