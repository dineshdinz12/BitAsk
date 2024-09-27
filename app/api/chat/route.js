import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { convertToCoreMessages, generateText, streamText } from "ai";
import { createConnection } from "mysql2/promise";
import { z } from 'zod';

const google = createGoogleGenerativeAI({
  apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY,
});

const getConnection = async () => {
  return await createConnection({
    host: "localhost",
    user: "root",
    database: "students_db",
    password: process.env.MYSQL_PASSWORD,
  });
};

const extractJson = (responseText) => {
  try {
    const jsonMatch = responseText.match(/```json\n([\s\S]*?)\n```/);
    if (jsonMatch && jsonMatch[1]) {
      return JSON.parse(jsonMatch[1]);
    }
    throw new Error("No valid JSON found in the response");
  } catch (error) {
    console.error("JSON parsing error:", error);
    return { query: null, message: "Failed to parse SQL query" };
  }
};

const generateSQLQuery = async (prompt) => {
  const system_prompt = {
    database_structure: {
      students: {
        columns: {
          id: "INT",
          name: "VARCHAR(100)",
          age: "INT",
          course: "VARCHAR(100)",
        },
      },
    },
    persona: "You are an SQL query generator for a student database system.",
    objective: "Generate accurate SQL queries to retrieve student information.",
    instructions: [
      "Analyze the user's request carefully.",
      "Generate an SQL query that matches the request.",
      "Ensure the query is compatible with the given database structure.",
      "Use appropriate SQL functions and clauses when necessary.",
      "Always return the response in JSON format within code blocks.",
    ],
    output_format: "```json\n{\n  \"message\": \"A brief explanation of the query\",\n  \"query\": \"The SQL query\"\n}\n```",
  };

  const response = await generateText({
    model: google("gemini-1.5-pro-latest"),
    prompt: `Given the following request: "${prompt}", generate an SQL query for our student database. ${JSON.stringify(system_prompt)}`,
    maxSteps: 5,
  });

  const result = extractJson(response.text);
  return result.query;
};

const access_db = async (message) => {
  try {
    const sqlQuery = await generateSQLQuery(message);
    if (!sqlQuery) {
      throw new Error("Failed to generate SQL query");
    }
    
    const connection = await getConnection();
    const [rows] = await connection.execute(sqlQuery);
    await connection.end();
    
    return { success: true, result: rows };
  } catch (error) {
    console.error("Error in accessing Database:", error);
    return { success: false, error: error.message };
  }
};

export async function POST(req) {
  const { messages, selectedOption } = await req.json();

  const modelMap = {
    "gemini-1.5-pro-latest": "gemini-1.5-pro-latest",
    "gemini-1.5-flash-latest": "gemini-1.5-flash-latest",
    "gemini-1.0-pro": "gemini-1.0-pro",
  };

  const model_ = google(modelMap[selectedOption] || "gemini-1.5-flash-latest");

  const system_instructions = {
    persona: "You are a friendly and knowledgeable assistant specializing in student information.",
    objective: "Provide accurate and helpful information about students in the database.",
    instructions: [
      "Respond to queries about student details in a clear and concise manner.",
      "Use the access_db tool to retrieve information from the database when needed.",
      "Explain the information in a way that's easy for users to understand.",
      "If a query is ambiguous, ask for clarification before accessing the database.",
    ],
    remember: "You have access to a student database with information about their id, name, age, and course.",
    examples: [
      {
        input: "What are the details of student with id 1?",
        output: "Let me fetch that information for you. The details of the student with id 1 are: Name: John Doe, Age: 20, Course: Computer Science.",
      },
    ],
  };

  try {
    const text = await streamText({
      model: model_,
      messages:convertToCoreMessages(messages),
      maxSteps: 4,
      system: JSON.stringify(system_instructions),
      tools: {
        access_db: {
          description: "Search for the required data in the student database",
          parameters: z.object({
            message: z.string(),
          }),
          execute: async ({ message }) => {
            return await access_db(message);
          },
        },
      },
    });
    return text.toDataStreamResponse();
  } catch (error) {
    console.error("Error in POST request:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}