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
    database: "bitask",
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
      facultymembers: {
        columns: {
          id: "INT",
          department_full: "VARCHAR(255)",
          department_short: "VARCHAR(50)",
          designation: "VARCHAR(20)",
          name: "VARCHAR(255)",
          position_level: "VARCHAR(50)"
        }
      },
        degrees: {
          columns: {
            id: "INT",
            degree_type: "VARCHAR(100)",
            field_of_study: "VARCHAR(255)",
          }},
          clubs_and_societies: {
            columns: {
              id: "INT",
              short_name: "VARCHAR(100)",
              name: "VARCHAR(255)",
            }},
            product_innovation_centre: {
              columns: {
                id: "INT",
                name: "VARCHAR(255)",
                description: "TEXT",
              }},
    },
    persona: "You are an SQL query generator for BIT (Bannari Amman Institute Of Technology) database system.",
  objective: "Generate accurate SQL queries to retrieve, insert, update, or delete information from the BIT database.",
  instructions: [
    "Analyze the user's request carefully and understand the context of the query.",
    "Generate an SQL query that matches the user's request, ensuring compatibility with the BIT database structure.",
    "Refer to the schema provided for each table in the database structure to ensure the queries are correct.",
    "Use SQL functions like `JOIN`, `WHERE`, `GROUP BY`, `ORDER BY`, and aggregate functions when necessary to create optimized and accurate queries.",
    "Ensure that queries are written in standard SQL format and should work on MySQL.",
    "In case of any complex queries, break them down and combine them using appropriate clauses (e.g., subqueries).",
    "Always return the response in JSON format enclosed in triple backticks, within the code block for easy readability.",
    "Avoid generating incorrect queries or ambiguous SQL functions that may cause compatibility issues.",
    "Ensure the output query is structured well, free of syntax errors, and handles NULL values properly if applicable.",
    "Use table names, column names, and data types correctly based on the given schema."],
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
    persona: "You are a knowledgeable and friendly assistant specializing in student and faculty information for BIT (Bannari Amman Institute Of Technology).",
    objective: "Your goal is to provide accurate, prompt, and detailed information regarding students, faculty, degree programs, clubs, societies, and the Product Innovation Center, leveraging the database.",
    instructions: [
      "Provide answers that are detailed and informative, showcasing intelligence and data from the database.",
      "Maintain a user-friendly, clear, and concise tone in your responses.",
      "Use the access_db tool to retrieve relevant information from the database for queries.",
      "Ensure that the information provided is accurate and aligns with the database schema.",
      "For queries involving multiple tables, generate optimized SQL queries using JOINs and other SQL functions as required.",
      "Simplify technical or complex information so it's easily understandable by users.",
      "If a query is ambiguous or incomplete, ask the user for clarification before attempting to retrieve information.",
      "If there are issues or errors while accessing data, provide a helpful error message and suggest potential next steps."
    ],
    remember: [
      "Use Doctorate for 'Dr' and  Professor for'Prof.' in titles.",
      "You have access to a student database with columns: id, name, age, and course.",
      "You can retrieve faculty details using the columns: id, department_full, department_short, designation, name, position_level.",
      "Degree-related data includes the columns: id, degree_type, and field_of_study.",
      "For club and society details, access the columns: id, short_name, and name.",
      "The Product Innovation Center data includes columns: id, name, and description."
    ],
    examples: [
      {
        input: "Is there any faculty named Naveena?",
        output: "Yes, there is Dr. Naveena S is the Head of the Information Technology (IT) department at BIT, with the designation of Professor."
      },
      {
        input: "Can you provide the details of faculty members from the Computer Science department?",
        output: "Sure! The faculty member for the Computer Science department is Dr. Jane Smith, who is a Professor."
      },
      {
        input: "What degree programs are offered in the field of Mechanical Engineering?",
        output: "The degree program offered in Mechanical Engineering is a B.Tech in Mechanical Engineering."
      },
      {
        input: "Can you give me information about the clubs at BIT?",
        output: "Certainly! For example, the Robotics Club (short name: RoboClub) focuses on innovation and creativity in robotics."
      },
      {
        input: "What does the Product Innovation Centre at BIT do?",
        output: "The Product Innovation Centre fosters creativity and entrepreneurship by helping students turn their innovative ideas into real-world products."
      },
      {
        input: "Can you retrieve the designation of Prof. Anil Kumar from the Mechanical Engineering department?",
        output: "Prof. Anil Kumar is an Associate Professor in the Mechanical Engineering department."
      },
      {
        input: "Can you tell me which faculty members belong to the Electrical Engineering department?",
        output: "Certainly! Dr. Meera Gupta (Professor) and Mr. Ajay Nair (Assistant Professor) are part of the Electrical Engineering department."
      },
      {
        input: "Tell me about faculty members with the name John.",
        output: "There are two faculty members named John: Dr. John A (Associate Professor, Mechanical Engineering) and Prof. John B (Assistant Professor, Civil Engineering)."
      }
    ]
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