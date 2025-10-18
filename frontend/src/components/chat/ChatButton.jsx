import React, { useState, useEffect } from 'react';
import { Badge, IconButton, Tooltip, CircularProgress } from '@mui/material';
import { Chat as ChatIcon } from '@mui/icons-material';
import { getConversationBySchedule } from '../../services/chatService';
import ChatWindow from './ChatWindow';

/**
 * Component button mở chat
 * @param {number} scheduleId - ID lịch bảo trì
 * @param {object} scheduleDetails - Chi tiết lịch với đầy đủ thông tin:
 *   - customerId, technicianId, customerName, technicianName, deviceName, scheduledDate
 * @param {number} currentUserId - ID user hiện tại
 * @param {string} currentUserName - Tên user hiện tại
 * @param {string} currentUserRole - Role (user/technician)
 * @param {boolean} showAlways - Hiển thị button ngay cả khi chưa có conversation (mặc định false)
 */
export default function ChatButton({
  scheduleId,
  scheduleDetails,
  currentUserId,
  currentUserName,
  currentUserRole,
  showAlways = false,
}) {
  const [conversation, setConversation] = useState(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const [loading, setLoading] = useState(true);

  // Lấy conversation theo scheduleId
  useEffect(() => {
    if (!scheduleId || !scheduleDetails) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = getConversationBySchedule(
      scheduleId,
      scheduleDetails, // Pass scheduleDetails để tự động tạo nếu chưa có
      (conv) => {
        setConversation(conv);
        setLoading(false);

        // Kiểm tra tin nhắn chưa đọc (đơn giản: nếu có lastMessage)
        if (conv?.lastMessage) {
          setHasUnread(true);
        }
      }
    );

    return () => unsubscribe();
  }, [scheduleId, scheduleDetails]);

  const handleOpenChat = () => {
    setChatOpen(true);
    setHasUnread(false); // Đánh dấu đã đọc khi mở chat
  };

  const handleCloseChat = () => {
    setChatOpen(false);
  };

  // Nếu đang loading, không hiển thị gì
  if (loading) return null;

  // Chỉ hiển thị button khi có conversation hoặc showAlways = true
  if (!conversation && !showAlways) return null;

  return (
    <>
      <Tooltip title='Chat với kỹ thuật viên'>
        <IconButton color='primary' size='small' onClick={handleOpenChat}>
          <Badge color='error' variant='dot' invisible={!hasUnread}>
            <ChatIcon />
          </Badge>
        </IconButton>
      </Tooltip>

      {chatOpen && (
        <ChatWindow
          conversation={conversation}
          currentUserId={currentUserId}
          currentUserName={currentUserName}
          currentUserRole={currentUserRole}
          onClose={handleCloseChat}
        />
      )}
    </>
  );
}
