"use client";

import { useChat } from "ai/react";
import { useState, useEffect } from "react";
import '../app/fonts/page.css'; // Importing CSS for styling
import { FaRobot } from "react-icons/fa6"; // Importing icon for UI
import Markdown from "markdown-to-jsx"; // For rendering Markdown messages

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
        <div className="cat">
          <div className="Bot">
            <FaRobot /> {/* Robot icon */}
          </div>
          <strong>&ensp;BitAsk</strong> {/* Chatbot name */}
        </div>
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
