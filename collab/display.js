document.addEventListener("DOMContentLoaded", function() {

  function updateControls() {
    const controlsContainer = document.getElementById('collab-controls');
    
    // Get the current displayed controls
    const displayedControls = controlsContainer.querySelectorAll('.control');
  
    // Check for new controls to add or existing controls to update
    Object.keys(window.chTracker.recentControls).forEach(key => {
      let { value, from, time } = window.chTracker.recentControls[key];
      
      // if value is a float, round to 2 decimal places
      if (typeof value === 'number') {
        value = Math.round(value * 100) / 100;
      }
  
      const controlId = `controls-${key}`;
      const existingControl = document.getElementById(controlId);
      
      if (existingControl) {
        // Update the value if it has changed
        const valueElement = existingControl.querySelector('.value');
        const fromElement = existingControl.querySelector('.from');
        if (valueElement.innerText != value || fromElement.innerText != `(${from})`) {
          valueElement.innerText = value;
          fromElement.innerText = `(${from})`;
          
          // Change text weight to bold
          existingControl.style.fontWeight = 'bold';
          setTimeout(() => {
            existingControl.style.fontWeight = 'normal';
          }, 2000); // Change back to normal after 2 seconds
        }
      } else {
        // Add new control
        const controlElement = document.createElement('div');
        controlElement.className = 'property control hidden'; // Initially hidden for fade-in effect
        controlElement.id = controlId;
        controlElement.innerHTML = `
          <span class="name">${key}:</span>
          <span class="value">${value}</span>
          <span class="from">(${from})</span>
        `;
        controlsContainer.appendChild(controlElement);
  
        // Trigger reflow to enable transition
        controlElement.offsetHeight;
  
        // Fade in the element
        controlElement.classList.remove('hidden');
  
        // Change text weight to bold
        controlElement.style.fontWeight = 'bold';
        setTimeout(() => {
          controlElement.style.fontWeight = 'normal';
        }, 2000); // Change back to normal after 2 seconds
      }
    });
  
    // Check for controls to remove
    displayedControls.forEach(control => {
      const key = control.id.replace('controls-', '');
      if (!window.chTracker.recentControls[key]) {
        // Fade out and remove the element
        control.classList.add('hidden');
        setTimeout(() => {
          control.remove();
        }, 300); // Adjust timing to match your transition duration
      }
    });
  }
  

  function updateEvents() {
    const eventsContainer = document.getElementById('collab-events');
    
    // Get the current displayed events
    const displayedEvents = eventsContainer.querySelectorAll('.event');
  
    // Check for new events to add or existing events to update
    window.chTracker.recentEvents.forEach((event, index) => {
      let { header, time, from } = event;
      
      const eventId = `events-${index}`;
      const existingEvent = document.getElementById(eventId);
      
      if (existingEvent) {
        // Update the value if it has changed
        const headerElement = existingEvent.querySelector('.header');
        const fromElement = existingEvent.querySelector('.from');
        if (headerElement.innerText != header || fromElement.innerText != `(${from})`) {
          headerElement.innerText = header;
          fromElement.innerText = `(${from})`;
          
          // Change text weight to bold
          existingEvent.style.fontWeight = 'bold';
          setTimeout(() => {
            existingEvent.style.fontWeight = 'normal';
          }, 2000); // Change back to normal after 2 seconds
        }
      } else {
        // Add new event
        const eventElement = document.createElement('div');
        eventElement.className = 'property event hidden'; // Initially hidden for fade-in effect
        eventElement.id = eventId;
        eventElement.innerHTML = `
          <span class="header">${header}</span>
          <span class="from">(${from})</span>
        `;
        eventsContainer.appendChild(eventElement);
  
        // Trigger reflow to enable transition
        eventElement.offsetHeight;
  
        // Fade in the element
        eventElement.classList.remove('hidden');
  
        // Change text weight to bold
        eventElement.style.fontWeight = 'bold';
        setTimeout(() => {
          eventElement.style.fontWeight = 'normal';
        }, 2000); // Change back to normal after 2 seconds
      }
    });
  
    // Check for events to remove
    displayedEvents.forEach(event => {
      const key = event.id.replace('events-', '');
      if (!window.chTracker.recentEvents[key]) {
        // Fade out and remove the element
        event.classList.add('hidden');
        setTimeout(() => {
          event.remove();
        }, 300); // Adjust timing to match your transition duration
      }
    });
  }
  
  // sample window.chTracker.reventChat:
  // {
  //   "message"
  //   "from"
  // }
  function updateChat() {
    const chatContainer = document.getElementById('collab-chat');
    
    // Get the current displayed chat
    const displayedChat = chatContainer.querySelectorAll('.chat');
  
    // Check for new chat to add or existing chat to update
    window.chTracker.recentChat.forEach((chat, index) => {
      let { message, from } = chat;
      
      const chatId = `chat-${index}`;
      const existingChat = document.getElementById(chatId);
      
      if (!existingChat) {
        // Add new chat
        const chatElement = document.createElement('div');
        chatElement.className = 'property chat hidden'; // Initially hidden for fade-in effect
        chatElement.id = chatId;
        chatElement.innerHTML = `
          <span class="message"><span style="font-weight: bold;">${from}:</span> ${message}</span>
        `;
        chatContainer.appendChild(chatElement);
  
        // Trigger reflow to enable transition
        chatElement.offsetHeight;
  
        // Fade in the element
        chatElement.classList.remove('hidden');
      }
    });
  
    // Check for chat to remove
    displayedChat.forEach(chat => {
      const key = chat.id.replace('chat-', '');
      if (!window.chTracker.recentChat[key]) {
        // Fade out and remove the element
        chat.classList.add('hidden');
        setTimeout(() => {
          chat.remove();
        }, 300); // Adjust timing to match your transition duration
      }
    });
  }


  // Initial display of controls
  updateControls();
  updateEvents();
  updateChat();

  // Example: Simulate update or deletion of properties in a loop
  setInterval(() => {
    // Update controls display
    updateControls();
    updateEvents();
    updateChat();
  }, 100); // Repeat every 0.5 seconds

});


// send message handler
sendChatMessage.addEventListener('click', () => {
  let newChatMessageEl = document.getElementById('newChatMessage')
  ch.chat(newChatMessageEl.value)
  newChatMessageEl.placeholder = 'New message'
  newChatMessageEl.value = ''
});

// join room handler
joinRoomButton.addEventListener('click', () => {
  let roomNameEl = document.getElementById('roomName')
  ch.joinRoom(roomNameEl.value)
  roomNameEl.placeholder = 'Joined ' + roomNameEl.value
  roomNameEl.value = ''
});

// change username handler
changeUserName.addEventListener('click', () => {
  let newUserNameEl = document.getElementById('newUserName')
  ch.setUsername(newUserNameEl.value)
  newUserNameEl.placeholder = 'New user: ' + newUserNameEl.value
  newUserNameEl.value = ''
});
