import React, { useEffect, useState } from 'react';
import axios from 'axios';

const API_URL = 'https://devapi.beyondchats.com/api/get_all_chats?page=1';

function Homepage() {
  const [apiData, setApiData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(API_URL);
        setApiData(response.data);
      } catch (error) {
        console.error('Error fetching API data:', error);
      }
    };

    fetchData();
  }, []);

  const formatTime = (timestamp) => {
    const currentDate = new Date();
    const messageDate = new Date(timestamp);
    const diffTime = Math.abs(currentDate - messageDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays > 7) {
      // Format as dd MMM (three-letter month abbreviation)
      const options = { day: 'numeric', month: 'short' };
      return messageDate.toLocaleDateString('en-GB', options);
    } else if (diffDays > 1) {
      // Format as day name (e.g., Monday, Tuesday)
      const options = { weekday: 'long' };
      return messageDate.toLocaleDateString('en-US', options);
    } else if (diffDays === 1) {
      // Yesterday
      return 'Yesterday';
    } else {
      // Format as hh:mm am/pm
      let hours = messageDate.getHours();
      const minutes = messageDate.getMinutes().toString().padStart(2, '0');
      const ampm = hours >= 12 ? 'pm' : 'am';
      hours = hours % 12;
      hours = hours ? hours : 12; // the hour '0' should be '12'
      return `${hours}:${minutes} ${ampm}`;
    }
  };

  return (
    <div>
      <h1>Creator Names with Last Message</h1>
      {apiData && apiData.data && apiData.data.data && apiData.data.data.length > 0 ? (
        <ul>
          {apiData.data.data.map(chat => (
            <li key={chat.id}>
              <strong>Name:</strong> {chat.creator && chat.creator.name ? chat.creator.name : 'Unknown'}
              <br />
              <strong>Last Message:</strong> {chat.msg_count > 0 ? `${chat.msg_count} messages` : 'No messages'}
              <br />
              <strong>Last Message Time:</strong> {chat.updated_at ? formatTime(chat.updated_at) : 'Unknown'}
            </li>
          ))}
        </ul>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}

export default Homepage;
