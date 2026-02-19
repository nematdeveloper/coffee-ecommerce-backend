const openaiService = require('../services/openai');

const handleMessage = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        reply: "Please provide a message"
      });
    }

    const reply = await openaiService.getChatResponse(message);
    
    res.json({
      success: true,
      reply: reply
    });

  } catch (error) {
    console.error('Chatbot error:', error);
    res.status(500).json({
      success: false,
      reply: "Sorry, I'm having trouble. Please try again."
    });
  }
};

module.exports = { handleMessage };