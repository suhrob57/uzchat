import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

const users = [];

export const registerUser = (req, res) => {
  const { username, password } = req.body;
  const hashedPassword = bcrypt.hashSync(password, 10);
  const newUser = { id: uuidv4(), username, password: hashedPassword };
  users.push(newUser);
  res.status(201).json({ message: 'Foydalanuvchi ro‘yxatdan o‘tkazildi', user: newUser });
};

export const loginUser = (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username);
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ error: 'Login yoki parol noto‘g‘ri' });
  }
  res.json({ message: 'Muvaffaqiyatli login qilindi', user });
};
