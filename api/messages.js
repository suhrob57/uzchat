const messages = [];

export const getMessages = (req, res) => {
  res.json(messages);
};

export const addMessage = (req, res) => {
  const { username, text } = req.body;
  const newMessage = { username, text, timestamp: new Date() };
  messages.push(newMessage);
  res.status(201).json(newMessage);
};
