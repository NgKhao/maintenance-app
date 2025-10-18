import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  IconButton,
  Avatar,
  Chip,
  CircularProgress,
} from '@mui/material';
import {
  Send as SendIcon,
  Close as CloseIcon,
  Person as PersonIcon,
  Build as BuildIcon,
} from '@mui/icons-material';
import { sendMessage, subscribeToMessages } from '../../services/chatService';

/**
 * Component chat window - Hiển thị cuộc trò chuyện
 * @param {object} conversation - Thông tin cuộc trò chuyện
 * @param {number} currentUserId - ID user hiện tại
 * @param {string} currentUserRole - Role user hiện tại (user/technician)
 * @param {function} onClose - Callback khi đóng chat
 */
export default function ChatWindow({
  conversation,
  currentUserId,
  currentUserName,
  currentUserRole,
  onClose,
}) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto scroll to bottom khi có tin nhắn mới
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Subscribe to messages realtime
  useEffect(() => {
    if (!conversation?.id) return;

    const unsubscribe = subscribeToMessages(conversation.id, (msgs) => {
      setMessages(msgs);
    });

    return () => unsubscribe();
  }, [conversation?.id]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || sending) return;

    try {
      setSending(true);
      await sendMessage(
        conversation.id,
        currentUserId,
        currentUserName,
        currentUserRole,
        newMessage
      );
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Lỗi khi gửi tin nhắn');
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diff = now - date;

    // Nếu trong ngày hôm nay
    if (diff < 86400000) {
      return date.toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
      });
    }
    // Nếu khác ngày
    return date.toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!conversation) {
    return (
      <Paper
        elevation={3}
        sx={{
          position: 'fixed',
          bottom: 20,
          right: 20,
          width: 400,
          height: 500,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography color='text.secondary'>
          Chọn cuộc trò chuyện để bắt đầu
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper
      elevation={3}
      sx={{
        position: 'fixed',
        bottom: 20,
        right: 20,
        width: { xs: '90%', sm: 400 },
        maxWidth: 400,
        height: 600,
        display: 'flex',
        flexDirection: 'column',
        zIndex: 1000,
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 2,
          bgcolor: 'primary.main',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Avatar sx={{ bgcolor: 'primary.dark' }}>
            {currentUserRole === 'user' ? <BuildIcon /> : <PersonIcon />}
          </Avatar>
          <Box>
            <Typography variant='subtitle2' fontWeight='bold'>
              {currentUserRole === 'user'
                ? conversation.technicianName
                : conversation.customerName}
            </Typography>
            <Typography variant='caption' sx={{ opacity: 0.9 }}>
              {conversation.deviceName}
            </Typography>
          </Box>
        </Box>
        <IconButton size='small' onClick={onClose} sx={{ color: 'white' }}>
          <CloseIcon />
        </IconButton>
      </Box>

      {/* Messages */}
      <Box
        sx={{
          flexGrow: 1,
          overflowY: 'auto',
          p: 2,
          bgcolor: 'grey.50',
        }}
      >
        {messages.length === 0 ? (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
            }}
          >
            <Typography variant='body2' color='text.secondary'>
              Bắt đầu cuộc trò chuyện
            </Typography>
          </Box>
        ) : (
          messages.map((msg) => {
            const isOwn = msg.senderId === currentUserId;
            return (
              <Box
                key={msg.id}
                sx={{
                  display: 'flex',
                  justifyContent: isOwn ? 'flex-end' : 'flex-start',
                  mb: 1.5,
                }}
              >
                <Box
                  sx={{
                    maxWidth: '70%',
                  }}
                >
                  {!isOwn && (
                    <Typography
                      variant='caption'
                      color='text.secondary'
                      sx={{ ml: 1 }}
                    >
                      {msg.senderName}
                    </Typography>
                  )}
                  <Paper
                    elevation={1}
                    sx={{
                      p: 1.5,
                      bgcolor: isOwn ? 'primary.main' : 'white',
                      color: isOwn ? 'white' : 'text.primary',
                      borderRadius: 2,
                    }}
                  >
                    <Typography
                      variant='body2'
                      sx={{ wordBreak: 'break-word' }}
                    >
                      {msg.message}
                    </Typography>
                    <Typography
                      variant='caption'
                      sx={{
                        display: 'block',
                        mt: 0.5,
                        opacity: 0.7,
                        fontSize: '0.7rem',
                      }}
                    >
                      {formatTimestamp(msg.createdAt)}
                    </Typography>
                  </Paper>
                </Box>
              </Box>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </Box>

      {/* Input */}
      <Box
        sx={{
          p: 2,
          borderTop: 1,
          borderColor: 'divider',
          bgcolor: 'background.paper',
        }}
      >
        {conversation.status === 'closed' ? (
          <Chip
            label='Cuộc trò chuyện đã đóng'
            color='default'
            size='small'
            sx={{ width: '100%' }}
          />
        ) : (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField
              fullWidth
              size='small'
              placeholder='Nhập tin nhắn...'
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={sending}
              multiline
              maxRows={3}
            />
            <IconButton
              color='primary'
              onClick={handleSendMessage}
              disabled={!newMessage.trim() || sending}
            >
              {sending ? <CircularProgress size={24} /> : <SendIcon />}
            </IconButton>
          </Box>
        )}
      </Box>
    </Paper>
  );
}
