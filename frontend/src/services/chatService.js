// Chat service - Firebase Firestore operations
import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  doc,
  updateDoc,
} from 'firebase/firestore';
import { db } from '../config/firebase';

/**
 * Tạo cuộc trò chuyện mới khi lịch được confirmed
 * @param {number} scheduleId - ID của lịch bảo trì
 * @param {number} customerId - ID khách hàng
 * @param {number} technicianId - ID kỹ thuật viên
 * @param {object} scheduleDetails - Chi tiết lịch bảo trì
 */
export const createConversation = async (
  scheduleId,
  customerId,
  technicianId,
  scheduleDetails
) => {
  try {
    const conversationRef = await addDoc(collection(db, 'conversations'), {
      scheduleId,
      customerId,
      technicianId,
      customerName: scheduleDetails.customerName,
      technicianName: scheduleDetails.technicianName,
      deviceName: scheduleDetails.deviceName,
      scheduledDate: scheduleDetails.scheduledDate,
      status: 'active', // active, closed
      createdAt: serverTimestamp(),
      lastMessage: null,
      lastMessageAt: null,
    });

    return conversationRef.id;
  } catch (error) {
    console.error('Error creating conversation:', error);
    throw error;
  }
};

/**
 * Gửi tin nhắn
 * @param {string} conversationId - ID cuộc trò chuyện
 * @param {number} senderId - ID người gửi
 * @param {string} senderName - Tên người gửi
 * @param {string} senderRole - Role người gửi (user/technician)
 * @param {string} message - Nội dung tin nhắn
 */
export const sendMessage = async (
  conversationId,
  senderId,
  senderName,
  senderRole,
  message
) => {
  try {
    // Thêm tin nhắn vào subcollection messages
    await addDoc(collection(db, 'conversations', conversationId, 'messages'), {
      senderId,
      senderName,
      senderRole,
      message: message.trim(),
      createdAt: serverTimestamp(),
      read: false,
    });

    // Cập nhật lastMessage của conversation
    const conversationRef = doc(db, 'conversations', conversationId);
    await updateDoc(conversationRef, {
      lastMessage: message.trim(),
      lastMessageAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

/**
 * Lấy danh sách tin nhắn realtime
 * @param {string} conversationId - ID cuộc trò chuyện
 * @param {function} callback - Callback khi có tin nhắn mới
 */
export const subscribeToMessages = (conversationId, callback) => {
  const messagesRef = collection(
    db,
    'conversations',
    conversationId,
    'messages'
  );
  const q = query(messagesRef, orderBy('createdAt', 'asc'));

  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    callback(messages);
  });
};

/**
 * Lấy danh sách cuộc trò chuyện của user
 * @param {number} userId - ID user
 * @param {string} role - Role (user/technician)
 * @param {function} callback - Callback khi có thay đổi
 */
export const subscribeToConversations = (userId, role, callback) => {
  const conversationsRef = collection(db, 'conversations');
  const field = role === 'technician' ? 'technicianId' : 'customerId';
  const q = query(
    conversationsRef,
    where(field, '==', userId),
    orderBy('lastMessageAt', 'desc')
  );

  return onSnapshot(q, (snapshot) => {
    const conversations = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    callback(conversations);
  });
};

/**
 * Kiểm tra xem lịch đã có conversation chưa
 * Nếu chưa có và status = confirmed, tự động tạo mới
 * @param {number} scheduleId - ID lịch bảo trì
 * @param {object} scheduleDetails - Chi tiết lịch (để tạo conversation nếu chưa có)
 * @param {function} callback - Callback trả về conversation
 */
export const getConversationBySchedule = (
  scheduleId,
  scheduleDetails,
  callback
) => {
  const conversationsRef = collection(db, 'conversations');
  const q = query(conversationsRef, where('scheduleId', '==', scheduleId));

  return onSnapshot(q, async (snapshot) => {
    if (!snapshot.empty) {
      // Đã có conversation
      const conversation = {
        id: snapshot.docs[0].id,
        ...snapshot.docs[0].data(),
      };
      callback(conversation);
    } else {
      // Chưa có conversation, tự động tạo nếu có scheduleDetails
      if (scheduleDetails) {
        try {
          console.log('Creating new conversation for schedule:', scheduleId);
          const conversationId = await createConversation(
            scheduleId,
            scheduleDetails.customerId,
            scheduleDetails.technicianId,
            {
              customerName: scheduleDetails.customerName,
              technicianName: scheduleDetails.technicianName,
              deviceName: scheduleDetails.deviceName,
              scheduledDate: scheduleDetails.scheduledDate,
            }
          );
          console.log('Conversation created:', conversationId);
          // Callback sẽ được gọi lại bởi onSnapshot
        } catch (error) {
          console.error('Error auto-creating conversation:', error);
          callback(null);
        }
      } else {
        callback(null);
      }
    }
  });
};

/**
 * Đóng cuộc trò chuyện khi hoàn thành lịch
 * @param {string} conversationId - ID cuộc trò chuyện
 */
export const closeConversation = async (conversationId) => {
  try {
    const conversationRef = doc(db, 'conversations', conversationId);
    await updateDoc(conversationRef, {
      status: 'closed',
    });
  } catch (error) {
    console.error('Error closing conversation:', error);
    throw error;
  }
};
