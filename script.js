/**
 * Chat Interface Script
 * 
 * Handles chat UI, message sending, and receiving responses from API.
 * 
 * @author m4rtxn
 * @version 1.0.0
 * @license MIT
 * 
 * Usage:
 * - Connects to backend API at API_URL (default: http://localhost:8000)
 * - Supports sending user messages and displaying AI responses
 */

// Chat state
let chatHistory = [];
let sessionId = null;

// DOM Elements
const chatMessages = document.getElementById('chat-messages');
const userInput = document.getElementById('user-input');
const sendButton = document.getElementById('send-button');

// API Configuration
const API_URL = 'http://localhost:8000'; // Change this to your API URL

// Initialize chat
function initializeChat() {
    // Generate a random session ID if not exists
    sessionId = sessionId || 'session_' + Math.random().toString(36).substring(7);
    
    // Add welcome message
    addMessage('Welcome! How can I help you today?', 'bot');
}

// Add a message to the chat
function addMessage(text, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', `${sender}-message`);
    messageDiv.textContent = text;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Show typing indicator
function showTypingIndicator() {
    const indicator = document.createElement('div');
    indicator.classList.add('typing-indicator');
    indicator.innerHTML = '<span></span><span></span><span></span>';
    indicator.id = 'typing-indicator';
    chatMessages.appendChild(indicator);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Hide typing indicator
function hideTypingIndicator() {
    const indicator = document.getElementById('typing-indicator');
    if (indicator) {
        indicator.remove();
    }
}

// Format chat history for API
function formatChatHistory() {
    return chatHistory.map(msg => {
        return msg.role === 'human' 
            ? { human: msg.content }
            : { ai: msg.content };
    });
}

// Send message to API
async function sendMessage(message) {
    try {
        // Create request body exactly matching ChatRequest model
        const response = await fetch(`${API_URL}/chat/invoke`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                input: {
                    question: message,
                    chat_history: formatChatHistory(),
                    session_id: sessionId
                }
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('API Error:', errorData);
            throw new Error('API request failed');
        }

        const data = await response.json();
        return data.output;
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
}

// Handle send message
async function handleSendMessage() {
    const message = userInput.value.trim();
    if (!message) return;

    // Clear input
    userInput.value = '';

    // Add user message to chat
    addMessage(message, 'user');

    // Show typing indicator
    showTypingIndicator();

    try {
        // Send message to API and get response
        const response = await sendMessage(message);

        // Update chat history before showing response
        chatHistory.push(
            { role: 'human', content: message },
            { role: 'assistant', content: response }
        );

        // Hide typing indicator
        hideTypingIndicator();

        // Add bot response to chat
        addMessage(response, 'bot');
    } catch (error) {
        // Hide typing indicator
        hideTypingIndicator();
        
        // Show error message in chat
        addMessage('Sorry, I encountered an error. Please try again.', 'bot');
        console.error('Chat error:', error);
    }
}

// Event listeners
sendButton.addEventListener('click', handleSendMessage);

userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSendMessage();
    }
});

// Auto-resize textarea
userInput.addEventListener('input', () => {
    userInput.style.height = 'auto';
    userInput.style.height = Math.min(userInput.scrollHeight, 100) + 'px';
});

// Initialize chat when page loads
initializeChat(); 