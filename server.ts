import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

// Initialize GoogleGenAI SDK safely
let ai: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!ai) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is not configured. Please add it to your secrets in the AI Studio Settings menu.");
    }
    ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return ai;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "5mb" }));

  // API to generate ASCII using Gemini
  app.post("/api/generate-ascii", async (req, res) => {
    try {
      const { prompt, width = 60, height = 30, style = "blocks" } = req.body;
      if (!prompt || typeof prompt !== "string") {
         res.status(400).json({ error: "Missing prompt parameter" });
         return;
      }

      const client = getGeminiClient();

      const systemInstruction = `
You are an expert ASCII Art Generator. Your task is to output high-quality, recognizable ASCII drawing art centered around the user's prompt.
You must return a valid JSON object matching the requested schema.

The drawings must fit inside a grid of ${width} columns wide and ${height} rows tall.
Characters to use based on requested style "${style}":
- "blocks": Solid '█' (U+2588), dark shade '▓' (U+2593), medium shade '▒' (U+2592), light shade '░' (U+2591), and spaces ' ' for empty space. This is excellent for high-contrast volumetric paintings, skulls, sword icons, spaceships, objects.
- "braille": Use braille patterns (e.g., '⢀', '⠃', '⠇', '⠏', '⠟', '⠿', '⡿', '⣿', etc.) and spaces for fine outlines.
- "cyberpunk": Use tech characters like '+', '-', '=', 'x', '#', ':', 'O', 'I', 'V', '@', '█', '▒', ' ' to generate old-school CLI art.
- "lineart": Use lines, corners, and slashes: '╱', '╲', '╳', '═', '║', '╔', '╗', '╚', '╝', '╠', '╣', '╦', '╩', '╬', '━', '┃', ' ' to create structural diagrams, wireframes, or geometric figures.

Ensure the drawing is cleanly centered, fully composed, and spans most of the screen canvas without getting cropped.
Return a JSON object containing a "grid" array of lines, each of which must be a string exactly ${width} characters long.
So the "grid" array will contain exactly ${height} elements, each a string of length ${width}.
`;

      const response = await client.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `Create ASCII art representing: ${prompt}`,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              grid: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: `Exactly ${height} strings representing the rows of ASCII art, each matching exactly ${width} characters in width.`,
              },
            },
            required: ["grid"],
          },
        },
      });

      if (!response.text) {
        throw new Error("No response string from Gemini");
      }

      const data = JSON.parse(response.text.trim());
      res.json(data);
    } catch (error: any) {
      console.error("Gemini ASCII Generation error:", error);
      res.status(500).json({ error: error.message || "Failed to generate ASCII art with AI" });
    }
  });

  // API to assist with coloring or editing tips (chat-like)
  app.post("/api/suggest-palette", async (req, res) => {
    try {
      const { description } = req.body;
      const client = getGeminiClient();
      const response = await client.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `Provide a cool 3-color palette suggestion (hex codes and names) and a quick art design tip for a retro ASCII scene featuring: ${description}. Output format must be JSON.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              colors: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    hex: { type: Type.STRING },
                    accent: { type: Type.STRING, description: "how to use it (e.g., 'Core', 'Highlight', 'Shadow')" }
                  },
                  required: ["name", "hex", "accent"]
                }
              },
              tip: { type: Type.STRING }
            },
            required: ["colors", "tip"]
          }
        }
      });
      if (!response.text) {
        throw new Error("No response from Gemini");
      }
      res.json(JSON.parse(response.text.trim()));
    } catch (error: any) {
      console.error("Gemini suggest palette error:", error);
      res.status(500).json({ error: error.message || "Failed to get design suggestions" });
    }
  });

  // Vite development middleware vs Static Production files
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting server in DEVELOPMENT mode with Vite Middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Starting server in PRODUCTION mode with static files...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Express server running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Fatal server error:", err);
});
