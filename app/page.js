"use client";

import { useChat } from "ai/react";
import { useState, useEffect } from "react";
import '../app/fonts/page.css'; // Importing CSS for styling
import { FaRobot } from "react-icons/fa6"; // Importing icon for UI
import Markdown from "markdown-to-jsx"; // For rendering Markdown messages
import { SiMoodle } from "react-icons/si";
import { MdDashboard } from "react-icons/md";
import { GiArtificialIntelligence } from "react-icons/gi";
import { SiConan } from "react-icons/si";
import { FaWikipediaW } from "react-icons/fa";
import { SiBitdefender } from "react-icons/si";
export default function Home() {
  const [selectedOption, setSelectedOption] = useState("gemini-1.5-flash"); // Default model selected

  // Set up chat hooks with model selection logic
  const { messages, input, handleInputChange, handleSubmit } = useChat({
    experimental_prepareRequestBody: (pay_load) => {
      return {
        ...pay_load,
        selectedOption: selectedOption, // Pass the selected model to the backend
      };
    },
  });

  // Handle dropdown change for model selection
  const handleDropdownChange = (event) => {
    setSelectedOption(event.target.value);
  };

  // Log the selected model for debugging purposes
  useEffect(() => {
    console.log(`Selected model: ${selectedOption}`);
  }, [selectedOption]);

  return (
    <div className="chat-container">
      {/* Chat header */}
      <div className="box">
       < div className="header">
       <div className="cat">
          <div className="Bot">
            <FaRobot /> {/* Robot icon */}
          </div>
          <strong>&ensp;BitAsk</strong> {/* Chatbot name */}
        </div>
        </div>

        <div className="links">
          <div className="two-icon">
          <a href="https://www.bitsathy.ac.in/" target="_blank" rel="noopener noreferrer" className="official">
            {/* <img src="https://www.bitsathy.ac.in/favicon.ico" alt="BITS Favicon" className="favicon" /> */}
           <div style={{fontSize:'50px'}}><SiBitdefender /></div>
            Official Website
          </a>
          <a href="https://moodle.bitsathy.ac.in/" target="_blank" rel="noopener noreferrer" className="official">
            {/* <img src="" className="favicon" /> */}
            <div style={{fontSize:'50px'}}><SiMoodle /></div>
            Moodle
          </a>
          </div>
          {/* <a href="https://bip.bitsathy.ac.in/nova/dashboards/main" target="_blank" rel="noopener noreferrer">
            <img src="https://bip.bitsathy.ac.in/favicon.ico" alt="BIP Favicon" className="favicon" />
            BIP
          </a> */}
          <div className="two-icon">
          <a href="https://bip.bitsathy.ac.in/dashboard" target="_blank" rel="noopener noreferrer" className="official">
            {/* <img src="https://bip.bitsathy.ac.in/favicon.ico" alt="Student Dashboard Favicon" className="favicon" /> */}
            <div style={{fontSize:'50px'}}><MdDashboard /></div>
            Student Dashboard
          </a>
          <a href="https://ps.bitsathy.ac.in/" target="_blank" rel="noopener noreferrer" className="official">
            {/* <img src="https://ps.bitsathy.ac.in/favicon.ico" alt="Personalised Skill Favicon" className="favicon" /> */}
            <div style={{fontSize:'50px'}}><GiArtificialIntelligence /></div>
            Personalised Skill
          </a>
          </div>
          <div className="two-icon">
          <a href="https://camps.bitsathy.ac.in/" target="_blank" rel="noopener noreferrer" className="official">
            {/* <img src="https://camps.bitsathy.ac.in/favicon.ico" alt="CAMPS Favicon" className="favicon" /> */}
            <div style={{fontSize:'50px'}}><SiConan /></div>
            CAMPS
          </a>
          <a href="https://wiki.bitsathy.ac.in/" target="_blank" rel="noopener noreferrer" className="official">
            {/* <img src="https://wiki.bitsathy.ac.in/favicon.ico" alt="WIKI Favicon" className="favicon" /> */}
            <div style={{fontSize:'50px'}}><FaWikipediaW /></div>
            WIKI
          </a>
          </div>
        </div>
        <div className="footer">
       <strong><h1>© 2024 BIT</h1></strong></div>
      </div>

      {/* Chat body */}
      <div className="chat">
        <div className="chat-1">
          <div className="Value">
            {/* Dropdown for selecting AI model */}
            <select
              id="dropbox"
              value={selectedOption}
              onChange={handleDropdownChange}
            >
              <option value="gemini-1.5-flash-latest">Gemini Flash 1.5 Latest</option>
              <option value="gemini-1.5-pro-latest">Gemini Pro 1.5 Latest</option>
              <option value="gemini-1.5-pro">Gemini Pro 1.5</option>
            </select>
          </div>
        </div>

        {/* Message display */}
        <div className="chat-2">
          <div className="chat-box">
            {messages.map((m, index) => (
              <div key={index} className={`chat-message ${m.role}`}>
                <p className="message-text">
                  <Markdown>{m.content}</Markdown> 
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Input field and send button */}
        <div className="chat-3">
          <form onSubmit={handleSubmit} className="input-container">
            <input
              type="text"
              placeholder="Type a message..."
              value={input}
              onChange={handleInputChange}
              className="input-field"
            />
            <button type="submit" className="send-button">
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
