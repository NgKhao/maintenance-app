import React, { useState, useEffect, useRef, useCallback } from 'react';
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
import {
  sendMessage,
  subscribeToMessages,
  markMessagesAsRead,
  setTypingStatus,
  subscribeToConversation,
} from '../../services/chatService';

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
  const [conversationLive, setConversationLive] = useState(conversation);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const isTypingRef = useRef(false);

  useEffect(() => {
    setConversationLive(conversation);
  }, [conversation]);

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

  useEffect(() => {
    if (!conversation?.id) return;

    const unsubscribe = subscribeToConversation(conversation.id, (conv) => {
      setConversationLive(conv);
    });

    return () => unsubscribe();
  }, [conversation?.id]);

  useEffect(() => {
    if (!conversation?.id || !messages.length) return;

    markMessagesAsRead(conversation.id, currentUserId).catch((error) => {
      console.error('Error marking read in realtime effect:', error);
    });
  }, [conversation?.id, messages, currentUserId]);

  const startTyping = async () => {
    if (!conversation?.id || isTypingRef.current) return;

    isTypingRef.current = true;
    try {
      await setTypingStatus(conversation.id, {
        isTyping: true,
        userId: currentUserId,
        userName: currentUserName,
        userRole: currentUserRole,
      });
    } catch (error) {
      console.error('Error starting typing status:', error);
    }
  };

  const stopTyping = useCallback(async () => {
    if (!conversation?.id || !isTypingRef.current) return;

    isTypingRef.current = false;
    try {
      await setTypingStatus(conversation.id, {
        isTyping: false,
      });
    } catch (error) {
      console.error('Error stopping typing status:', error);
    }
  }, [conversation?.id]);

  const resetTypingTimeout = () => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      stopTyping();
    }, 1500);
  };

  const handleInputChange = (value) => {
    setNewMessage(value);

    if (value.trim()) {
      startTyping();
      resetTypingTimeout();
      return;
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
    stopTyping();
  };

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      stopTyping();
    };
  }, [stopTyping]);

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
      await stopTyping();
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

  const ownMessages = messages.filter((msg) => msg.senderId === currentUserId);
  const lastOwnMessageId = ownMessages.length
    ? ownMessages[ownMessages.length - 1].id
    : null;
  const isOtherUserTyping =
    Boolean(conversationLive?.typingUserId) &&
    conversationLive?.typingUserId !== currentUserId;

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
                ? conversationLive?.technicianName || conversation.technicianName
                : conversationLive?.customerName || conversation.customerName}
            </Typography>
            <Typography variant='caption' sx={{ opacity: 0.9 }}>
              {conversationLive?.deviceName || conversation.deviceName}
            </Typography>
          </Box>
        </Box>
        <IconButton
          size='small'
          onClick={async () => {
            await stopTyping();
            onClose();
          }}
          sx={{ color: 'white' }}
        >
          <CloseIcon />
        </IconButton>
      </Box>

      {/* Messages */}
      <Box
        sx={{
          flexGrow: 1,
          overflowY: 'auto',
          px: 1.5,
          py: 2,
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
                  mb: 1,
                }}
              >
                <Box
                  sx={{
                    maxWidth: { xs: '84%', sm: '76%' },
                    minWidth: 'fit-content',
                  }}
                >
                  {!isOwn && (
                    <Typography
                      variant='caption'
                      color='text.secondary'
                      sx={{ ml: 1.25, mb: 0.25, display: 'block', fontWeight: 500 }}
                    >
                      {msg.senderName}
                    </Typography>
                  )}
                  <Paper
                    elevation={0}
                    sx={{
                      px: 1.5,
                      py: 1,
                      bgcolor: isOwn ? 'primary.main' : 'white',
                      color: isOwn ? 'white' : 'text.primary',
                      border: isOwn ? 'none' : '1px solid',
                      borderColor: 'grey.200',
                      borderRadius: isOwn ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                      boxShadow: isOwn
                        ? '0 4px 10px rgba(25, 118, 210, 0.25)'
                        : '0 1px 6px rgba(15, 23, 42, 0.08)',
                    }}
                  >
                    <Typography
                      variant='body2'
                      sx={{
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                        overflowWrap: 'anywhere',
                        lineHeight: 1.45,
                      }}
                    >
                      {msg.message}
                    </Typography>
                    <Typography
                      variant='caption'
                      sx={{
                        display: 'block',
                        mt: 0.75,
                        opacity: isOwn ? 0.88 : 0.62,
                        fontSize: '0.7rem',
                        textAlign: 'right',
                      }}
                    >
                      {formatTimestamp(msg.createdAt)}
                    </Typography>
                  </Paper>
                  {isOwn && msg.id === lastOwnMessageId && (
                    <Typography
                      variant='caption'
                      color='text.secondary'
                      sx={{
                        mt: 0.35,
                        mr: 0.75,
                        display: 'block',
                        textAlign: 'right',
                        fontWeight: msg.read ? 600 : 500,
                      }}
                    >
                      {msg.read ? 'Đã xem' : 'Đã gửi'}
                    </Typography>
                  )}
                </Box>
              </Box>
            );
          })
        )}
        {isOtherUserTyping && (
          <Typography
            variant='caption'
            color='text.secondary'
            sx={{ display: 'block', mt: 1 }}
          >
            {(conversationLive?.typingUserName || 'Người dùng') + ' đang nhập...'}
          </Typography>
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
              onChange={(e) => handleInputChange(e.target.value)}
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
