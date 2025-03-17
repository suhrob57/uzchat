let userId = null;
let pusher;

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
        loadMessages();

        // Pusher’ni sozlash
        pusher = new Pusher('b55bb4e7ad730b3ac2c2', {
          cluster: 'ap2',
        });

        // Kanalga obuna bo‘lish
        const channel = pusher.subscribe(`chat-${userId}`);
        channel.bind('message', (data) => {
          const chatWindow = document.getElementById('chat-window');
          chatWindow.innerHTML += `<p>${data.sender_id}: ${data.content}</p>`;
          chatWindow.scrollTop = chatWindow.scrollHeight; // Chat oynasini pastga aylantirish
        });
      }
    });
}

function loadMessages() {
  fetch(`/api/messages?user_id=${userId}`)
    .then(res => res.json())
    .then(messages => {
      const chatWindow = document.getElementById('chat-window');
      chatWindow.innerHTML = messages.map(msg => `<p>${msg.sender_id}: ${msg.content}</p>`).join('');
      chatWindow.scrollTop = chatWindow.scrollHeight;
    });
}

function sendMessage() {
  const content = document.getElementById('message-input').value;
  if (content && userId) {
    const receiverId = prompt('Receiver ID:');
    fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sender_id: userId, receiver_id: receiverId, content }),
    }).then(() => {
      document.getElementById('message-input').value = '';
      loadMessages();
    });
  }
}

function createGroup() {
  const groupName = prompt('Guruh nomi:');
  if (groupName && userId) {
    alert(`Guruh "${groupName}" yaratildi!`);
  }
}
