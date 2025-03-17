let userId = null;
let socket = io();

function register() {
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  fetch('/api/auth', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'register', username, password }),
  }).then(() => login());
}

function login() {
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  fetch('/api/auth', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'login', username, password }),
  })
    .then(res => res.json())
    .then(data => {
      if (data.user_id) {
        userId = data.user_id;
        document.getElementById('login').style.display = 'none';
        document.getElementById('chat').style.display = 'block';
        socket.emit('join', userId);
        loadMessages();
      }
    });
}

function loadMessages() {
  fetch(`/api/messages?user_id=${userId}`)
    .then(res => res.json())
    .then(messages => {
      const chatWindow = document.getElementById('chat-window');
      chatWindow.innerHTML = messages.map(msg => `<p>${msg.sender_id}: ${msg.content}</p>`).join('');
    });
}

function sendMessage() {
  const content = document.getElementById('message-input').value;
  if (content && userId) {
    const receiverId = prompt('Receiver ID:'); // Oddiy uchun hardcoded, keyinroq tanlash tizimi qo‘shiladi
    fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sender_id: userId, receiver_id: receiverId, content }),
    }).then(() => {
      document.getElementById('message-input').value = '';
      socket.emit('sendMessage', { senderId: userId, receiverId, content });
      loadMessages();
    });
  }
}

function createGroup() {
  const groupName = prompt('Guruh nomi:');
  if (groupName && userId) {
    // Backend’da guruh yaratish API qo‘shilishi kerak (bu yerda oddiy qilib qoldik)
    alert(`Guruh "${groupName}" yaratildi!`);
  }
}

// Real vaqtda xabarlar olish
socket.on('receiveMessage', (data) => {
  if (data.receiverId === userId) {
    const chatWindow = document.getElementById('chat-window');
    chatWindow.innerHTML += `<p>${data.senderId}: ${data.content}</p>`;
  }
});
