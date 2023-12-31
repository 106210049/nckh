document.addEventListener("DOMContentLoaded", function () {
  // Event listener for form submission
  const messageForm = document.getElementById("messageForm");

  if (messageForm) {
    messageForm.addEventListener("submit", function (e) {
      e.preventDefault();
      const chatName = document.getElementById("chatName");
      const formData = new FormData(this);
      const message = formData.get("message").trim();
      formData.append("conversation", chatName.dataset.conversationId);
      if (message) {
        sendMessage(formData);
        addMessageToChatWindow("Bạn", message || "File đã gửi", true);
        this.reset();
      }
    });
  }

  // Event listener for search button
  const searchButton = document.querySelector(".input-group-append button");

  if (searchButton) {
    searchButton.addEventListener("click", function () {
      const searchInput = document.querySelector(
        '.input-group input[type="text"]'
      );
      const searchTerm = searchInput.value.toLowerCase();

      const userList = document.getElementById("userList");

      if (userList) {
        const users = userList.querySelectorAll(".list-group-item");
        users.forEach((user) => {
          const userName = user.textContent.toLowerCase();
          user.style.display = userName.includes(searchTerm) ? "" : "none";
        });
      }
    });
  }
});

// Function to send a message using axios
function sendMessage(formData) {
  const formDataObj = Object.fromEntries(formData.entries());

  axios
    .post("/api/v1/messages", formDataObj)
    .then(function (response) {
      console.log("Tin nhắn đã được gửi");
      socket.emit("chat message", formDataObj);
    })
    .catch(function (error) {
      console.error("Lỗi khi gửi tin nhắn:", error);
    });
}
socket.on("chat message", (msg) => {
  addMessageToChatWindow("", msg, true);
});
function addMessageToChatWindow(username, message, isSender, fileUrl) {
  const chatWindow = document.getElementById("chatWindow");
  const messageElement = document.createElement("div");
  messageElement.classList.add("message", isSender ? "sender" : "receiver");

  let messageContent = "";

  if (!isSender) {
    messageContent += `<strong>${username}:</strong> `;
  }

  if (fileUrl) {
  } else {
    messageContent += message;
  }

  messageElement.innerHTML = messageContent;
  chatWindow.appendChild(messageElement);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

// Function to load a conversation using axios
function loadConversation(conversationId, index, userId) {
  axios
    .get(`/api/v1/conversations/${conversationId}`)
    .then(function (response) {
      const { data } = response;
      const chatName = document.getElementById("chatName");
      const chatWindow = document.getElementById("chatWindow");

      if (index == 2) {
        chatName.textContent = data.data.name;
      } else {
        chatName.textContent = data.data.participants[index].name;
      }
      chatName.dataset.conversationId = conversationId;
      chatWindow.innerHTML = "";
      console.log(data.data);
      const messages = data.data.messages;
      messages.forEach((message) => {
        let isSender = false;
        if (message.sender._id == userId) {
          isSender = true;
        }
        addMessageToChatWindow(message.sender.name, message.message, isSender);
      });
    })
    .catch(function (error) {
      console.error("Lỗi khi tải cuộc hội thoại:", error);
    });
}
