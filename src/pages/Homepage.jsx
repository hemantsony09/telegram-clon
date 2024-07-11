import { useEffect, useState } from 'react';
import axios from 'axios';
import '@fortawesome/fontawesome-free/css/all.css';

const CHATS_API_URL = 'https://devapi.beyondchats.com/api/get_all_chats?page=1';
const MESSAGES_API_URL = 'https://devapi.beyondchats.com/api/get_chat_messages?chat_id=';

function Homepage() {
  const [chatsData, setChatsData] = useState(null);
  const [messagesByChatId, setMessagesByChatId] = useState({});
  const [lastMessages, setLastMessages] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredChatsByCreator, setFilteredChatsByCreator] = useState([]);
  const [isChatSelected, setIsChatSelected] = useState(false); // New state to manage visibility of container-left
  const currentUser = {
    id: 1,
    name: 'BeyondChat',
  };

  const fetchLastMessage = async (chatId) => {
    try {
      const response = await axios.get(`${MESSAGES_API_URL}${chatId}`);
      const messages = response.data.data;
      if (messages.length > 0) {
        const lastMessage = messages[messages.length - 1];
        setLastMessages((prevState) => ({
          ...prevState,
          [chatId]: lastMessage,
        }));
      }
    } catch (error) {
      console.error(`Error fetching messages for chat ID ${chatId}:`, error);
    }
  };

  useEffect(() => {
    const fetchChatsData = async () => {
      try {
        const response = await axios.get(CHATS_API_URL);
        setChatsData(response.data);
      } catch (error) {
        console.error('Error fetching chats API data:', error);
      }
    };

    fetchChatsData();
  }, []);

  useEffect(() => {
    if (chatsData && chatsData.data && chatsData.data.data) {
      chatsData.data.data.forEach((chat) => {
        fetchLastMessage(chat.id);
      });
    }
  }, [chatsData]);

  const fetchMessagesForChat = async (chatId) => {
    try {
      const response = await axios.get(`${MESSAGES_API_URL}${chatId}`);
      const messages = response.data.data;
      setMessagesByChatId((prevMessages) => ({
        ...prevMessages,
        [chatId]: messages,
      }));
    } catch (error) {
      console.error(`Error fetching messages for chat ID ${chatId}:`, error);
    }
  };

  useEffect(() => {
    if (chatsData && chatsData.data && chatsData.data.data) {
      chatsData.data.data.forEach((chat) => {
        fetchMessagesForChat(chat.id);
      });
    }
  }, [chatsData]);

  const formatTime = (timestamp) => {
    const messageDate = new Date(timestamp);
    let hours = messageDate.getHours();
    const minutes = messageDate.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    
    return `${hours}:${minutes} ${ampm}`;
  };

  const formatDate = (timestamp) => {
    const messageDate = new Date(timestamp);
    const options = { day: 'numeric', month: 'short', year: 'numeric' };
    return messageDate.toLocaleDateString('en-US', options);
  };

  const handleSearchChange = (event) => {
    const query = event.target.value;
    setSearchQuery(query);
  };

  const filterChatsByCreator = (creatorName) => {
    const filteredChats = chatsData && chatsData.data && chatsData.data.data
      ? chatsData.data.data.filter((chat) => {
        const name = chat.creator && chat.creator.name ? chat.creator.name.toLowerCase() : '';
        return name.includes(creatorName.toLowerCase());
      })
      : [];
    setFilteredChatsByCreator(filteredChats);
  };

  const handleChatClick = (creatorName) => {
    filterChatsByCreator(creatorName);
    setIsChatSelected(true); // Update state to hide container-left
  };

  return (
    <section className='Telegramhomepage'>
      <div className="homepage">
        <div className={`leftcontainer ${isChatSelected ? 'hidden' : ''}`}>
          <div className='headerbar'>
            <h2> </h2>
            <h2>Chats</h2>
            <h2><i className='bx bxs-edit'></i></h2>
          </div>
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search Chats"
              value={searchQuery}
              onChange={handleSearchChange}
              className="search-input"
            />
          </div>
          {chatsData && chatsData.data && chatsData.data.data && chatsData.data.data.length > 0 ? (
            <ul className="chat-list">
              {chatsData.data.data.map((chat) => (
                <li key={chat.id} onClick={() => handleChatClick(chat.creator.name)} className="chat-item">
                  <div className="avatar">
                    {chat.creator && chat.creator.name ? chat.creator.name.charAt(0) : 'U'}
                  </div>
                  <div className="chat-info">
                    <div className="chat-header">
                      <div className="chat-name">
                        {chat.creator && chat.creator.name ? chat.creator.name : 'Unknown'}
                      </div>
                      <div className="chat-time">
                        {messagesByChatId[chat.id] && messagesByChatId[chat.id].length > 0
                          ? formatTime(messagesByChatId[chat.id][0].created_at)
                          : 'Unknown'}
                      </div>
                    </div>
                    <div className="chat-message">
                      {lastMessages[chat.id]
                        ? `${lastMessages[chat.id].message.slice(0, 40)}${lastMessages[chat.id].message.length > 40 ? '...' : ''}`
                        : 'No messages'}
                    </div>
                  </div>
                </li>
              ))}
              <div className='navigation'>
                <div><i style={{color:'rgb(138 155 185)',padding:"0 20px"}} className='bx bxs-user-circle'></i></div>
                <div><i style={{color:'rgb(138 155 185)',padding:"0 20px"}} className='bx bxs-phone' ></i></div>
                <div><i style={{color:'rgb(138 155 185)',padding:"0 20px"}} className='bx bxs-chat'></i></div>
                <div><i style={{color:'rgb(138 155 185)',padding:"0 20px"}} className='bx bxs-cog' ></i></div>
              </div>
            </ul>
          ) : (
            <p className="loading-text">Loading...</p>
          )}
        </div>
      </div>
      <div className='container2'>
        {filteredChatsByCreator.length > 0 ? (
          <ul className="filtered-chat-list">
            {filteredChatsByCreator.map((chat, index) => (
              <li key={chat.id} className="filtered-chat-item">
                {index === 0 && (
                  <div className="date-separator">
                    {formatDate(messagesByChatId[chat.id][0].created_at)}
                  </div>
                )}
                <div className="chat-info">
                  <div className="chat-header">
                    <div className="container2chat-name ">
                      <div className='container2chat-name1'>
                        <div className="avatar">
                          {chat.creator && chat.creator.name ? chat.creator.name.charAt(0) : 'U'}
                        </div>
                        {chat.creator && chat.creator.name ? chat.creator.name : 'Unknown'}
                      </div>
                      <div className='contenct'>
                        <i style={{color:"#5797ff"}} className='bx bxs-phone-call'></i>
                        <i style={{color:"#5797ff"}} className='bx bx-search'></i>
                        <i style={{color:"#5797ff"}} className='bx bx-dots-horizontal-rounded' ></i>
                      </div>
                    </div>
                  </div>
                  <div className="chat-messages">
                    {messagesByChatId[chat.id] && messagesByChatId[chat.id].length > 0 ? (
                      messagesByChatId[chat.id].map((message) => (
                        <div key={message.id} className="message">
                          <div className={`message-text ${message.sender_id === currentUser.id ? 'user-message' : 'other-message'}`}>
                            <div className='message-box'>
                              <div className='box1'>
                                <p className="message-sender">{message.sender.name}</p>
                                {message.message}
                              </div>
                              <p className="message-time">{formatTime(message.created_at)}</p>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p>No messages</p>
                    )}
                  </div>
                </div>
              </li>
            ))}
            <div className='Srearchbar'>
              <div><i style={{color:'rgb(138 155 185)',padding:"0 20px"}} className='bx bx-link-alt'></i></div>
              <div><input type="text" placeholder='Write a message here' name="" id="" /></div>
              <div><i style={{color:'rgb(138 155 185)',padding:"0 20px"}} className='bx bx-send' ></i></div>
              <div><i style={{color:'rgb(138 155 185)',padding:"0 20px"}} className='bx bx-smile'></i></div>
              <div><i style={{color:'rgb(138 155 185)',padding:"0 20px"}} className='bx bx-microphone' ></i></div>
            </div>
          </ul>
        ) : (
          <p className="no-filtered-chats">Select a chat to start messaging</p>
        )}
      </div>
    </section>
  );
}

export default Homepage;
