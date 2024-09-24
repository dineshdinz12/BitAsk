"use client";
import '../app/fonts/page.css';
import { FaRobot } from "react-icons/fa6";

const {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} = require("@google/generative-ai");
import { useState } from "react";

const MODEL_NAME = "gemini-1.5-flash";
const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

export default function Home() {
  const [data, setData] = useState([]);
  const [error, setError] = useState("");
  const [prompt, setPrompt] = useState("");
              
  async function runChat(prompt) {
    try {
      const genAI = new GoogleGenerativeAI(API_KEY);
      const model = genAI.getGenerativeModel({ model: MODEL_NAME });

      const generationConfig = {
        temperature: 1,
        topP: 0.95,
        topK: 64,
        maxOutputTokens: 8192,
        responseMimeType: "text/plain",
      };

      const safetySettings = [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
      ];

      const chat = model.startChat({
        generationConfig,
        safetySettings,
        history: data.map((entry) => ({
          role: entry.role,
          parts: [{ text: entry.message }],
        })),
      });

      const result = await chat.sendMessage(prompt);
      const response = result.response;

      if (response) {
        setData((prevData) => [
          ...prevData,
          { role: "user", message: prompt },
          { role: "model", message: response.text() },
        ]);
        setPrompt(""); 
      } else {
        setError("No response from the AI.");
      }
    } catch (err) {
      console.error("Error during AI generation:", err);
      setError("Error during AI generation. Check the console for details.");
    }
  }

  const onSubmit = async (event) => {
    event.preventDefault();
    if (prompt.trim()) {
      setError(""); // Reset error state
      await runChat(prompt.trim());
    }
  };
   const [select,setselect] = useState('Gemini-flash-1.5')
   const handleSelect = (event) => {
   setselect(event.target.value);
   setData((prevData) => [
    ...prevData,
    { role: "user", message:`Model changed to ${event.target.value}`},
    { role: "model", message: "Ok" },
  ]);
};
  return (
    <div className="chat-container">
      <div className='box'>
        <div className='cat'> <div className="Bot"> <FaRobot /></div><bold>&ensp;BitAsk </bold></div>

        </div>
     <div className='chat'>
      <div className='chat-1'>
      <div className='Value'>
         <select onChange={handleSelect}>
        <option value="Gemini-flash-1.5">Gemini-flash-1.5</option>
        <option value="Gemini-pro-1.5">Gemini-pro-1.5</option>
        <option value="Gemini-pro-1">Gemini-pro-1</option>
      </select></div></div>
     <div className='chat-2'> 
      <div className="chat-box">
        {/* Chat history */}
        {data.map((entry, index) => (
          <div key={index} className={`chat-message ${entry.role}`}>
            <p className="message-text">{entry.message}</p>
          </div>
        ))}
      </div></div>
      <div className='chat-3'>
      {/* User input at the bottom */}
      <form onSubmit={onSubmit} className="input-container">
        <input 
          type="text"
          placeholder="Type a message..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="input-field"
        />
        <button
          type="submit"
          className="static send-button"
        >
          Send
        </button>
      </form>

      {/* Display error */}
      {error && (
        <div className="error-message">
          <h1>Error</h1>
          <p>{error}</p>
        </div>
      )}
     </div>
     </div> 
    </div>
  );
}