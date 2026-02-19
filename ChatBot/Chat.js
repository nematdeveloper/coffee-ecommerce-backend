const express = require('express');
const cors = require('cors');
const { OpenAI } = require('openai');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

app.post('/api/chat', async (req, res) => {
  try {
    const { message } = req.body;
    
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are Rayan Saffron assistant. Answer about saffron quality, pricing, shipping. Be helpful and concise."
        },
        { role: "user", content: message }
      ],
      max_tokens: 150
    });
  
    

    res.json({
      success: true,
      reply: completion.choices[0].message.content
      
      
    });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      success: false,
      reply: "Sorry, having trouble. Try again."
    });
  }
});

