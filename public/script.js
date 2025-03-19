let userId = null;
let pusher;

function register() {
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  fetch('/api/auth', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'register', username, password }),
  })
    .then(response => response.text()) // JSON o'rniga text bilan tekshiramiz
    .then(text => {
      try {
        const data = JSON.parse(text); // JSON ga o'giramiz
        console.log('Register response:', data);

        if (data.user_id) {
          userId = data.user_id;
          document.getElementById('login').style.display = 'none';
          document.getElementById('chat').style.display = 'block';
          loadMessages();
          setupPusher();
        } else {
          alert(data.error || 'Registration failed');
        }
      } catch (error) {
        console.error('JSON parse error:', error, 'Server response:', text);
      }
    })
    .catch(error => console.error('Register error:', error));
}

function login() {
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  fetch('/api/auth', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'login', username, password }),
  })
    .then(response => response.text()) // JSON o'rniga text bilan tekshiramiz
    .then(text => {
      try {
        const data = JSON.parse(text); // JSON ga o'giramiz
        console.log('Login response:', data);

        if (data.user_id) {
          userId = data.user_id;
          document.getElementById('login').style.display = 'none';
          document.getElementById('chat').style.display = 'block';
          loadMessages();
          setupPusher();
        } else {
          alert(data.error || 'Login failed');
        }
      } catch (error) {
        console.error('JSON parse error:', error, 'Server response:', text);
      }
    })
    .catch(error => console.error('Login error:', error));
}

function loadMessages() {
  fetch(`/api/messages?user_id=${userId}`)
    .then(response => {
      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }
      return response.json();
    })
    .then(messages => {
      const chatWindow = document.getElementById('chat-window');
      chatWindow.innerHTML = messages.map(msg => `<p>${msg.sender_id}: ${msg.content}</p>`).join('');
      chatWindow.scrollTop = chatWindow.scrollHeight;
    })
    .catch(error => console.error('Load messages error:', error));
}

function sendMessage() {
  const content = document.getElementById('message-input').value;
  if (content && userId) {
    const receiverId = prompt('Receiver ID:');
    
    fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sender_id: userId, receiver_id: receiverId, content }),
    })
      .then(response => response.text()) // JSON o'rniga text bilan tekshiramiz
      .then(text => {
        try {
          const data = JSON.parse(text); // JSON ga o'giramiz
          console.log('Send message response:', data);
          document.getElementById('message-input').value = '';
          loadMessages();
        } catch (error) {
          console.error('JSON parse error:', error, 'Server response:', text);
        }
      })
      .catch(error => console.error('Send message error:', error));
  }
}

function createGroup() {
  const groupName = prompt('Guruh nomi:');
  if (groupName && userId) {
    alert(`Guruh "${groupName}" yaratildi!`);
  }
}

function setupPusher() {
  pusher = new Pusher('b55bb4e7ad730b3ac2c2', {
    cluster: 'ap2',
  });
  const channel = pusher.subscribe(`chat-${userId}`);
  channel.bind('message', (data) => {
    const chatWindow = document.getElementById('chat-window');
    chatWindow.innerHTML += `<p>${data.sender_id}: ${data.content}</p>`;
    chatWindow.scrollTop = chatWindow.scrollHeight;
  });
}
