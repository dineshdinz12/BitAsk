"use client";

import { useChat } from "ai/react";
import { useState, useEffect } from "react";
import '../app/fonts/page.css';
import { FaRobot } from "react-icons/fa6";

export default function Home() {
  const [selectedOption, setSelectedOption] = useState("gemini-flash-1.5");

  const { messages, input, handleInputChange, handleSubmit } = useChat({
    experimental_prepareRequestBody: (pay_load) => {
      return {
        ...pay_load,
        selectedOption: selectedOption, 
      };
    },
  });

  const handleDropdownChange = (event) => {
    setSelectedOption(event.target.value);
  };

  useEffect(() => {
    console.log(`Selected model: ${selectedOption}`);
  }, [selectedOption]);

  const handleFormSubmit = (e) => {
    e.preventDefault();
    handleSubmit();
  };

  return (
    <div className="chat-container">
      <div className="box">
        <div className="cat">
          <div className="Bot">
            <FaRobot />
          </div>
          <bold>&ensp;BitAsk</bold>
        </div>
      </div>

     
      <div className="chat">
      <div className="chat-1">
        <div className="Value">
          <select
            id="dropbox"
            value={selectedOption}
            onChange={handleDropdownChange}
          >
            <option value="gemini-flash-1.5">Gemini Flash 1.5</option>
            <option value="gemini-pro-1.5">Gemini Pro 1.5</option>
            <option value="gemini-pro-1">Gemini Pro 1</option>
          </select>
        </div>
      </div>

 
      <div className="chat-2">
        <div className="chat-box">
          {messages.map((m, index) => (
            <div key={index} className={`chat-message ${m.role}`}>
              <p className="message-text">
                {m.content}
              </p>
            </div>
          ))}
        </div>
      </div>
    


      <div className="chat-3">
        <form onSubmit={handleFormSubmit} className="input-container">
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
