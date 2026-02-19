const TelegramBot = require('node-telegram-bot-api');

const Token = process.env.TOKEN;
const bot = new TelegramBot(Token, { polling: true });
const chatId = process.env.CHATID;

exports.sendEmail = async (req, res) => {
  const { email } = req.body;

  try {
    const message = `
📬 *New Email Submission!*

💡 Someone has submitted their email to contact you.

✉️ Email: _${email}_

Please reach out to them as soon as possible Mr Khodadadi! ✅
    `;

    await bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });

    res.status(200).json({ success: true, message: "Email sent to Telegram!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to send email." });
  }
};
