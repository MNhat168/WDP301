import { set } from "date-fns";
import React, { useState, useEffect, useRef } from "react";
import SockJS from "sockjs-client";
import Stomp from "stompjs";
import { DateTime } from "luxon";

const ChatBox = () => {
  const [isChatboxOpen, setIsChatboxOpen] = useState(false);
  const [messagesState, setMessagesState] = useState([]); // Tin nhắn gửi và nhận chung
  const [currentUserId, setCurrentUserId] = useState(null);
  const [activeReceiverId, setActiveReceiverId] = useState(null);
  const [activeReceiverName, setActiveReceiverName] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [recentChatsList, setRecentChatsList] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [stompClient, setStompClient] = useState(null);
  const [unreadCounts, setUnreadCounts] = useState({});
  const chatInputRef = useRef(null);
  const hasInitialized = useRef(false);
  const [visibleTimestamps, setVisibleTimestamps] = useState([]); // Lưu trữ các tin nhắn hiển thị thời gian
  const [position, setPosition] = useState({ top: 620, left: 1400 }); // Vị trí ban đầu của chat icon
  const [isDragging, setIsDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isMinimized, setIsMinimized] = React.useState(false);
  const [showMinimizedBar, setShowMinimizedBar] = useState(false);
  const [minimizedReceiverId, setMinimizedReceiverId] = useState(null);
  const [minimizedReceiverName, setMinimizedReceiverName] = useState("");
  const [minimizedBars, setMinimizedBars] = useState([]);
  const [activeReceiverIds, setActiveReceiverIds] = useState([]); // Danh sách các activeReceiverId

  useEffect(() => {
    const fetchUserData = async () => {
      if (hasInitialized.current) return; // Kiểm tra xem đã khởi tạo chưa
      hasInitialized.current = true; // Đánh dấu đã khởi tạo

      try {
        const response = await fetch("http://localhost:8080/user/current", {
          credentials: "include",
        });
        const data = await response.json();
        if (data.userId) {
          setCurrentUserId(data.userId);
          initializeWebSocket(data.userId);
          fetchRecentChats(data.userId);
          updateUnreadMessageCounts(data.userId);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();

    return () => {
      console.log("Cleanup logic if needed");
      // Thêm logic dọn dẹp nếu cần
      stompClient?.disconnect();
    };
  }, []); // Mảng phụ thuộc rỗng

  useEffect(() => {
    if (searchQuery.trim()) {
      searchUsersAndCompanies();
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        // Người dùng không ở trong tab hiện tại => có thể phát âm thanh
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  const initializeWebSocket = (userId) => {
    const socket = new SockJS("http://localhost:8080/chat");
    const client = Stomp.over(socket);

    client.connect({}, () => {
      console.log("WebSocket connected");
      client.subscribe(`/topic/messages/${userId}`, (message) => {
        const parsedMessage = JSON.parse(message.body);
        handleIncomingMessage(parsedMessage); // Gọi hàm xử lý tin nhắn mới

        if (parsedMessage.sentTime) {
          // Tách microseconds từ chuỗi ISO
          const [isoPart, microsecondsPart] = parsedMessage.sentTime.split(".");

          // Chuyển đổi ISO 8601 thành đối tượng DateTime với Luxon
          const vietnamTime = DateTime.fromISO(isoPart, {
            zone: "Asia/Ho_Chi_Minh",
          });

          // Chuyển microseconds từ phần dư thành số nguyên (nếu có)
          const microseconds = microsecondsPart
            ? parseInt(microsecondsPart.slice(0, 6), 10) // Lấy tối đa 6 chữ số đầu (microseconds)
            : 0;

          // Tạo mảng thời gian theo cấu trúc yêu cầu
          const timeArray = [
            vietnamTime.year, // Năm
            vietnamTime.month, // Tháng
            vietnamTime.day, // Ngày
            vietnamTime.hour, // Giờ
            vietnamTime.minute, // Phút
            vietnamTime.second, // Giây
            microseconds, // Microseconds (đã xử lý)
          ];

          // Cập nhật parsedMessage với mảng thời gian mới
          parsedMessage.sentTime = timeArray;
        }
      // Kiểm tra block chat của người gửi
const receiverChatBlock = document.getElementById(
  `chat-block-${parsedMessage.sender.userId}`
);

// Nếu tin nhắn là của người nhận
if (parsedMessage.receiver.userId === userId) {
  // Kiểm tra trạng thái tab hiện tại, nếu đang không ở tab hiện tại thì phát âm thanh
  if (document.visibilityState === "hidden") {
    const audio = new Audio("/sounds/discord-message.mp3");
    audio.play();
  }

  // Kiểm tra nếu block chat của người gửi đã mở
  if (receiverChatBlock && receiverChatBlock.style.display !== "none") {
    // Nếu block chat đã mở, hiển thị tin nhắn và đánh dấu là đã đọc
    displayMessage(parsedMessage);
    markMessagesAsRead(userId, parsedMessage.sender.userId);
  } else {
    // Nếu chưa mở block chat của người gửi, mở thanh thu nhỏ bên cạnh
    setMinimizedBars((prevBars) => {
      // Kiểm tra xem thanh thu nhỏ đã tồn tại chưa
      const existingBar = prevBars.find(
        (bar) => bar.id === parsedMessage.sender.userId
      );

      if (!existingBar) {
        // Nếu chưa có, thêm thanh thu nhỏ mới
        return [
          ...prevBars,
          {
            id: parsedMessage.sender.userId,
            name: `${parsedMessage.sender.firstName} ${parsedMessage.sender.lastName}`,
            isMinimized: true,
          },
        ];
      }

      // Nếu đã tồn tại, giữ nguyên danh sách
      return prevBars;
    });

    // Đánh dấu tin nhắn chưa đọc
    updateUnreadMessageCounts(userId);
  }
}});

      setStompClient(client);
    });
  };

  const fetchRecentChats = async (userId) => {
    try {
      const response = await fetch(
        `http://localhost:8080/api/chat/recentChats?userId=${userId}`
      );
      const chats = await response.json();
      setRecentChatsList(chats);
    } catch (error) {
      console.error("Error fetching recent chats:", error);
    }
  };

  const updateUnreadMessageCounts = async (userId) => {
    try {
      // Get the unread message counts
      const unreadCountResponse = await fetch(
        `http://localhost:8080/api/chat/unreadCount?userId=${userId}`
      );
      if (!unreadCountResponse.ok) {
        throw new Error(`HTTP error! Status: ${unreadCountResponse.status}`);
      }
      const unreadCounts = await unreadCountResponse.json();
      setUnreadCounts(unreadCounts);

      // Cập nhật tổng số tin nhắn chưa đọc
      const totalUnreadCount = Object.values(unreadCounts).reduce(
        (total, count) => total + count,
        0
      );
      setUnreadCount(totalUnreadCount);

      // Fetch recent chats
      const recentChatsResponse = await fetch(
        `http://localhost:8080/api/chat/recentChats?userId=${userId}`
      );
      if (!recentChatsResponse.ok) {
        throw new Error(`HTTP error! Status: ${recentChatsResponse.status}`);
      }
      const recentChatsData = await recentChatsResponse.json();
      setRecentChatsList(recentChatsData);
    } catch (error) {
      console.error("Error updating unread message counts:", error);
    }
  };

  const searchUsersAndCompanies = async () => {
    try {
      const response = await fetch(
        `http://localhost:8080/api/chat/searchUsersAndCompanies?query=${searchQuery}`
      );
      const results = await response.json();
      setSearchResults(results);
    } catch (error) {
      console.error("Error searching users/companies:", error);
      setSearchResults([]);
    }
  };

  const sendMessage = () => {
    const content = chatInputRef.current.value.trim();

    if (stompClient?.connected && content) {
      const vietnamTime = DateTime.now().setZone("Asia/Ho_Chi_Minh");

      const message = {
        senderId: currentUserId,
        receiverId: activeReceiverId,
        content,
        sentTime: [
          vietnamTime.year, // Năm
          vietnamTime.month, // Tháng
          vietnamTime.day, // Ngày
          vietnamTime.hour, // Giờ
          vietnamTime.minute, // Phút
          vietnamTime.second, // Giây
          vietnamTime.millisecond * 1000, // Chuyển từ milliseconds sang microseconds
        ],
        isSentByCurrentUser: true,
      };

      // Gửi tin nhắn qua WebSocket
      stompClient.send("/app/send", {}, JSON.stringify(message));

      // Thêm tin nhắn vào danh sách tin nhắn và sắp xếp
      setMessagesState((prevState) =>
        [...prevState, message].sort(
          (a, b) => new Date(a.sentTime) - new Date(b.sentTime)
        )
      );

      // Xóa nội dung trong input
      chatInputRef.current.value = "";
    }
  };

  const displayMessage = (message) => {
    // Thêm thuộc tính isSentByCurrentUser khi tin nhắn mới gửi
    const updatedMessage = {
      ...message,
      isSentByCurrentUser: message.senderId === currentUserId,
    };

    // Cập nhật danh sách tin nhắn (giữ nguyên thứ tự)
    setMessagesState((prevMessages) => [...prevMessages, updatedMessage]);
  };

  const loadMessages = async (receiverId) => {
    try {
      const response = await fetch(
        `http://localhost:8080/api/chat/messages?senderId=${currentUserId}&receiverId=${receiverId}`
      );
      const messages = await response.json();

      // Thêm thuộc tính isSentByCurrentUser để phân biệt tin nhắn gửi và nhận
      const updatedMessages = messages.map((msg) => ({
        ...msg,
        isSentByCurrentUser: msg.sender.userId === currentUserId,
      }));

      // Cập nhật danh sách tin nhắn đã tải vào state
      setMessagesState(updatedMessages);

      // Gọi hàm để đánh dấu tin nhắn là đã đọc khi bắt đầu cuộc trò chuyện
      markMessagesAsRead(currentUserId, receiverId);

      // Cập nhật lại số lượng tin nhắn chưa đọc
      updateUnreadMessageCounts(currentUserId);
    } catch (error) {
      console.error("Error loading messages:", error);
    }
  };

  const markMessagesAsRead = async (senderId, receiverId) => {
    try {
      const response = await fetch(
        `http://localhost:8080/api/chat/markAsRead?senderId=${receiverId}&receiverId=${senderId}`,
        {
          method: "PUT",
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
    } catch (error) {
      console.error("Error marking messages as read:", error);
    }
  };

  const handleEnter = (event) => {
    if (event.key === "Enter") sendMessage();
  };

  const toggleTimestamp = (index) => {
    setVisibleTimestamps((prev) => {
      if (prev.includes(index)) {
        // Nếu thời gian đang hiển thị, xóa index khỏi danh sách
        return prev.filter((i) => i !== index);
      } else {
        // Nếu thời gian chưa hiển thị, thêm index vào danh sách
        return [...prev, index];
      }
    });
  };

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setOffset({
      x: e.clientX - position.left,
      y: e.clientY - position.top,
    });
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      setPosition({
        left: e.clientX - offset.x,
        top: e.clientY - offset.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Đảm bảo sự kiện chỉ hoạt động khi click chuột
  React.useEffect(() => {
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging]);

  const handleToggleChatbox = () => {
    setIsChatboxOpen((prev) => !prev);
    fetchRecentChats(currentUserId);
    updateUnreadMessageCounts(currentUserId);
  };

  const handleIncomingMessage = (parsedMessage) => {
    const senderId = parsedMessage.sender.userId;
    const senderName = `${parsedMessage.sender.firstName} ${parsedMessage.sender.lastName}`;

    // Kiểm tra nếu thanh thu nhỏ của người gửi đã tồn tại
    setMinimizedBars((prevBars) => {
      const isAlreadyMinimized = prevBars.some((bar) => bar.id === senderId);

      if (!isAlreadyMinimized) {
        // Thêm thanh mới nếu chưa tồn tại
        return [...prevBars, { id: senderId, name: senderName }];
      }
      return prevBars; // Giữ nguyên nếu đã tồn tại
    });
  };

  return (
    <div
      className="chatbox fixed z-50"
      style={{ top: `${position.top}px`, left: `${position.left}px` }}
      onMouseDown={handleMouseDown}
    >
      {/* Icon Chat */}
      {(!isChatboxOpen || isMinimized) && (
        <div
          className="chat-icon z-50 bg-gradient-to-r from-blue-500 to-blue-700 text-white p-4 rounded-full shadow-md cursor-pointer hover:scale-110 transition-transform duration-300 ease-in-out"
          onClick={() => {
            setIsMinimized(false); // Mở lại chatbox
            handleToggleChatbox(); // Mở chatbox
          }}
        >
          💬
          {unreadCount > 0 && (
            <span className="unread-count absolute top-0 right-0 bg-red-600 text-white text-xs rounded-full px-2 py-1 shadow-md">
              {unreadCount}
            </span>
          )}
        </div>
      )}

      {/* Render các thanh thu nhỏ */}
      {minimizedBars.length > 0 && (
        <div className="flex fixed bottom-10 right-40 space-x-4">
          {minimizedBars.map((bar) => (
            <div
              key={bar.id}
              className={`minimized-bar bg-blue-600 text-white p-2 rounded-t-lg shadow-md cursor-pointer w-[250px] flex justify-between items-center ${
                bar.isMinimized ? "block" : "block"
              }`}
              onClick={() => {
                setActiveReceiverId(bar.id);
                // Cập nhật activeReceiverName khi click vào thanh thu nhỏ
                setActiveReceiverName(bar.name);
                setMinimizedBars((prevBars) =>
                  prevBars.filter((b) => b.id !== bar.id)
                );
                // Mở lại chatbox khi click vào thanh thu nhỏ
                setShowMinimizedBar(false);
                setIsChatboxOpen(true);
                setIsMinimized(false);
                loadMessages(bar.id); // Load tin nhắn cho người dùng đúng
                markMessagesAsRead(currentUserId, bar.id);
                updateUnreadMessageCounts(currentUserId);

               
              }}
            >
              {/* Hiển thị tên người trò chuyện */}
              <span className="font-bold">{bar.name}</span>

              {/* Hiển thị số lượng tin nhắn chưa đọc */}
              {unreadCounts[bar.id] > 0 && (
                <span className="unread-count bg-red-500 text-white rounded-full text-xs px-2 py-1">
                  {unreadCounts[bar.id]}
                </span>
              )}

              {/* Nút Tắt */}
              <span
                className="text-2xl cursor-pointer hover:text-red-400"
                onClick={(e) => {
                  e.stopPropagation(); // Ngăn sự kiện click lan ra ngoài
                  setMinimizedBars((prevBars) =>
                    prevBars.filter((b) => b.id !== bar.id)
                  );
                }}
              >
                &times; {/* Icon dấu nhân */}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Main Chatbox Modal */}
      {isChatboxOpen && !isMinimized && (
        <div className="chatbox-modal bg-white shadow-2xl rounded-lg w-[350px] max-w-[90%] h-[500px] fixed bottom-0 right-0 flex flex-col transform translate-y-0 opacity-100 transition-all duration-300 ease-out">
          {!activeReceiverId ? (
            <>
              {/* Header */}
              <div className="chatbox-header bg-gradient-to-r from-blue-500 to-blue-700 text-white px-4 py-3 flex items-center justify-between rounded-t-lg ">
                <input
                  type="text"
                  placeholder="Find by Users or Companies name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 p-2 text-gray-700 bg-gray-100 rounded-md focus:outline-none focus:ring focus:ring-blue-300"
                />

                <span
                  className="close-btn text-2xl cursor-pointer hover:text-red-400 ml-4"
                  onClick={handleToggleChatbox}
                >
                  &times;
                </span>
              </div>

              {/* Search Results */}
              {searchQuery.trim() && (
                <div className="search-results bg-gray-50 p-4 max-h-[250px] overflow-y-auto border-b border-gray-200">
                  {searchResults.length > 0 ? (
                    searchResults.map((result, index) => {
                      const displayName =
                        result.companyName ||
                        `${result.firstName} ${result.lastName}`;
                      const userType = result.companyName ? " (Công ty)" : "";

                      return (
                        <div
                          key={index}
                          className="search-item flex justify-between items-center py-2 px-3 cursor-pointer hover:bg-gray-200 rounded-md"
                          onClick={() => {
                            const selectedId = result.companyName
                              ? result.user.userId
                              : result.userId;
                            setActiveReceiverId(selectedId);
                            setActiveReceiverName(displayName);
                            loadMessages(selectedId);
                          }}
                        >
                          <div>
                            <span className="text-black font-semibold">
                              {displayName}
                            </span>
                            <span className="text-gray-500 text-sm ml-2">
                              {userType}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center text-gray-500">
                      User or Company doest't exist.
                    </div>
                  )}
                </div>
              )}

              {/* Recent Chats */}
              <div className="recent-chats flex-1 overflow-y-auto p-4">
                <h3 className="text-lg font-semibold mb-4 text-gray-800 text-center">
                  Recents Chats
                </h3>

                {recentChatsList.length > 0 ? (
                  recentChatsList.map((chat) => {
                    const unreadCount = unreadCounts[chat.userId] || 0;
                    return (
                      <div
                        key={chat.userId}
                        className="chat-item py-2 px-3 flex justify-between items-center rounded-md hover:bg-gray-200 cursor-pointer"
                        onClick={() => {
                          setActiveReceiverId(chat.userId);

                          setActiveReceiverName(
                            `${chat.firstName} ${chat.lastName}`
                          );
                          loadMessages(chat.userId);
                          markMessagesAsRead(currentUserId, chat.userId);
                          updateUnreadMessageCounts(currentUserId);
                        }}
                      >
                        <span className="text-black font-medium">
                          {chat.firstName} {chat.lastName}
                        </span>
                        {unreadCount > 0 && (
                          <span className="unread-count bg-red-500 text-white rounded-full text-xs px-2 py-1">
                            {unreadCount}
                          </span>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center text-gray-500">
                    Không có cuộc trò chuyện nào gần đây.
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              {/* Chat with Specific User */}
              {activeReceiverId && (
                <div
                  id={`chat-block-${activeReceiverId}`}
                  className="messages-container flex flex-col h-full"
                >
                  {/* Header */}
                  <div className="messages-header bg-gradient-to-r from-blue-500 to-blue-700 text-white px-4 py-3 rounded-t-lg flex items-center justify-between">
                    {/* Tên người đang trò chuyện */}
                    <span className="font-bold">{activeReceiverName}</span>

                    {/* Nút điều khiển */}
                    <div className="flex items-center">
                      {/* Nút Minimize */}
                      <span
                        className="minimize-btn text-2xl cursor-pointer hover:text-yellow-400 mr-4"
                        onClick={() => {
                          setMinimizedBars((prevBars) => {
                            // Kiểm tra nếu thanh đã bị minimize hay chưa
                            const existingBar = prevBars.find(
                              (bar) => bar.id === activeReceiverId
                            );
                            if (!existingBar) {
                              // Nếu thanh chưa bị minimize, thêm nó vào
                              return [
                                ...prevBars,
                                {
                                  id: activeReceiverId,
                                  name: activeReceiverName,
                                  isMinimized: true, // Đánh dấu thanh này là đã thu nhỏ
                                },
                              ];
                            } else {
                              // Nếu thanh đã có trong danh sách, thay đổi trạng thái minimize của nó
                              return prevBars.map((bar) =>
                                bar.id === activeReceiverId
                                  ? { ...bar, isMinimized: !bar.isMinimized } // Đảo trạng thái minimize
                                  : bar
                              );
                            }
                          });

                          setIsChatboxOpen(false); // Đóng chatbox khi minimize
                          markMessagesAsRead(currentUserId, activeReceiverId);
                          updateUnreadMessageCounts(currentUserId); // Cập nhật số lượng tin nhắn chưa đọc
                        }}
                      >
                        &#8211; {/* Icon gạch ngang */}
                      </span>
                      {/* Nút Quay lại */}
                      <span
                        className="text-lg cursor-pointer hover:text-red-400"
                        onClick={() => {
                          setActiveReceiverId(null); // Đặt lại activeReceiverId
                          fetchRecentChats(currentUserId); // Lấy lại danh sách cuộc trò chuyện gần đây
                        }}
                      >
                        &larr;
                      </span>
                      {unreadCount > 0 && (
                        <span className="unread-count absolute top-0 right-0 bg-red-600 text-white text-xs rounded-full px-2 py-1 shadow-md">
                          {unreadCount}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Chat Messages */}
                  <div className="messages-body flex-1 overflow-y-auto p-4 bg-gray-100">
                    {messagesState
                      .sort(
                        (a, b) => new Date(b.sentTime) - new Date(a.sentTime)
                      ) // Sắp xếp tin nhắn theo thời gian, tin nhắn mới nhất lên đầu
                      .map((msg, index) => {
                        return (
                          <div
                            key={index}
                            className={`message-item p-3 rounded-lg max-w-[50%] ${
                              msg.isSentByCurrentUser
                                ? "bg-blue-400 text-black ml-auto" // Tin nhắn do người dùng gửi
                                : "bg-gray-300 text-black mr-auto" // Tin nhắn nhận được
                            }`}
                            style={{
                              wordWrap: "break-word",
                              whiteSpace: "pre-wrap",
                              marginBottom: "10px",
                            }}
                            onClick={() => toggleTimestamp(index)} // Thêm sự kiện click
                          >
                            <div>{msg.message || msg.content}</div>

                            {/* Hiển thị thời gian nếu đang được bật */}
                            {visibleTimestamps.includes(index) && (
                              <div className="text-xs text-gray-500 mt-1">
                                {Array.isArray(msg.sentTime) &&
                                msg.sentTime.length === 7
                                  ? (() => {
                                      const [
                                        year,
                                        month,
                                        day,
                                        hour,
                                        minute,
                                        second,
                                      ] = msg.sentTime;
                                      const date = new Date(
                                        Date.UTC(
                                          year,
                                          month - 1,
                                          day,
                                          hour,
                                          minute,
                                          second
                                        )
                                      );
                                      return date
                                        .toISOString()
                                        .replace("T", " ")
                                        .split(".")[0];
                                    })()
                                  : new Date(msg.sentTime)
                                      .toISOString()
                                      .replace("T", " ")
                                      .split(".")[0]}
                              </div>
                            )}

                            {/* Hiển thị trạng thái tin nhắn (Đã gửi / Đã đọc) chỉ cho tin nhắn do người dùng gửi, và chỉ hiển thị cho tin nhắn gần nhất */}
                            {msg.isSentByCurrentUser && (
                              <div className="text-xs text-gray-500 mt-1">
                                {msg === messagesState[messagesState.length - 1] // Kiểm tra xem có phải tin nhắn gần nhất của bạn không
                                  ? msg.read
                                    ? "Đã đọc"
                                    : ""
                                  : ""}
                              </div>
                            )}
                          </div>
                        );
                      })}
                  </div>

                  {/* Chat Input */}
                  <div className="chat-input bg-white p-4 flex items-center border-t border-gray-200 shadow-inner">
                    <input
                      ref={chatInputRef}
                      type="text"
                      placeholder="Nhập tin nhắn..."
                      className="flex-1 p-3 rounded-md bg-gray-100 text-black focus:outline-none focus:ring focus:ring-blue-300"
                      onKeyDown={handleEnter}
                    />
                    <button
                      onClick={sendMessage}
                      className="ml-2 bg-blue-600 text-white p-3 rounded-md hover:bg-blue-700 shadow-md"
                    >
                      Send
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};
export default ChatBox;
