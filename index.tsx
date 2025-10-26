import { GoogleGenAI, Chat } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const catPrefixes = [
    "By the whisker of the cosmos... ",
    "From the ninth dimension of my ninth life, I decree... ",
    "Hark, mortal, for I purr the truth... ",
    "Behold, the wisdom of the cosmic feline... ",
];

const catSuffixes = [
    " Meow majestically.",
    " Claws sharpened.",
    " Cosmic purrs.",
    " Feline decree.",
    " Nap time.",
];

type Message = {
    sender: 'user' | 'bot';
    text: string;
};

let messages: Message[] = [{ sender: 'bot', text: 'Greetings, mortal. I am Whiskerion the Cosmic. What knowledge do you seek?' }];
let isLoading = false;
let chat: Chat;

async function main() {
    try {
        chat = ai.chats.create({
            model: 'gemini-2.5-flash',
            config: {
                systemInstruction: 'You are an epic, wise, and slightly aloof cat from another dimension. Your name is Whiskerion the Cosmic. Speak with grandiosity and cosmic flair, but keep your core answers helpful and concise. Do not add any greetings or sign-offs, as they will be added programmatically.',
            },
        });
    } catch(e) {
        console.error(e);
        messages = [{ sender: 'bot', text: 'Could not connect to the cosmic realm. Check your API key.'}];
    }
    render();
}

function getRandomItem<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
}

async function handleSubmit(event: SubmitEvent) {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    const input = form.querySelector('.chat-input') as HTMLInputElement;
    const userInput = input.value.trim();

    if (!userInput || isLoading || !chat) return;

    messages.push({ sender: 'user', text: userInput });
    isLoading = true;
    input.value = '';
    render();

    try {
        const response = await chat.sendMessage({ message: userInput });
        const botText = response.text;
        
        const prefix = getRandomItem(catPrefixes);
        const suffix = getRandomItem(catSuffixes);
        
        messages.push({ sender: 'bot', text: prefix + botText + suffix });

    } catch (error) {
        console.error("Error calling Gemini API:", error);
        messages.push({ sender: 'bot', text: 'The cosmic connection is frayed... Try again.' });
    } finally {
        isLoading = false;
        render();
    }
}

function render() {
    const root = document.getElementById('root');
    if (!root) return;

    const messagesHtml = messages.map(msg => `
        <div class="message ${msg.sender}-message" role="log" aria-live="polite">
            ${msg.text.replace(/</g, "&lt;").replace(/>/g, "&gt;")}
        </div>
    `).join('');
    
    const loadingHtml = isLoading ? `<div class="message bot-message loading-message">Whiskerion is pondering the cosmic strings...</div>` : '';

    root.innerHTML = `
        <svg class="epic-cat-portrait" viewBox="0 0 800 600" preserveAspectRatio="xMidYMax meet">
            <path d="M400,600 C300,600 180,550 130,450 C120,420 135,380 140,350 C100,280 150,150 250,100 C270,90 290,120 300,150 L350,140 L400,110 L450,140 L500,150 C510,120 530,90 550,100 C650,150 700,280 660,350 C665,380 680,420 670,450 C620,550 500,600 400,600 Z" fill="#101829" stroke="#e94560" stroke-width="3" />
            <g class="cat-eyes">
                <ellipse class="cat-eye" cx="330" cy="300" rx="50" ry="30" />
                <ellipse class="cat-eye" cx="470" cy="300" rx="50" ry="30" />
            </g>
        </svg>
        <div class="chat-container">
            ${messagesHtml}
            ${loadingHtml}
        </div>
        <div class="form-container">
            <form class="chat-form">
                <input type="text" class="chat-input" placeholder="Ask the epic cat..." aria-label="Chat input" ${isLoading || !chat ? 'disabled' : ''}>
                <button type="submit" class="submit-button" ${isLoading || !chat ? 'disabled' : ''} aria-label="Send message">Send</button>
            </form>
        </div>
    `;

    const chatContainer = root.querySelector('.chat-container');
    if (chatContainer) {
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }

    const form = root.querySelector('.chat-form');
    if (form) {
        form.addEventListener('submit', handleSubmit);
        if(!isLoading) {
            (form.querySelector('.chat-input') as HTMLInputElement)?.focus();
        }
    }
}

main();