import bot from "./assets/bot.svg";
import user from "./assets/user.svg";

const form = document.querySelector('form');
const chatContainer = document.querySelector('#chat_container');
const serverApi = "http://localhost:5000/";

let loadInterval;

/**
 * This will show ... as a loading animation when processing
 * @param {object} element 
 */
function loader(element) {
  element.textContent = '';

  //every 300ms  it will add '.'
  loadInterval = setInterval(() => {
    element.textContent += '.';

    //resetting textContent
    if (element.textContent === '....') {
      element.textContent = '';
    }
  }, 300);
}

/**
 * When Ai has an answer answer will write letter by letter
 * @param {object} elemet 
 * @param {string} text 
 */
function typeText(elemet, text) {
  let index = 0;

  let interval = setInterval(() => {
    if (index < text.length) {
      elemet.innerHTML += text.charAt(index);
      index++;
    } else {
      clearInterval(interval);
    }
  }, 20);
}

/**
 * Will generate unique ID for question
 * @returns unique id string
 */
function generateUniqueId() {
  const timeStamp = Date.now();
  const randomNumber = Math.random();
  const hexadecimalString = randomNumber.toString(16);

  return `id-${timeStamp}-${hexadecimalString}`
}

/**
 * Generate chat line among bot and user
 * @param {boolean} isAi 
 * @param {string} value 
 * @param {string} uniqueId 
 * @returns template string of code
 */
function chatStripe(isAi, value, uniqueId) {
  return (
    `
      <div class="wrapper ${isAi && 'ai'}">
        <div class="chat">
          <div class="profile">
            <img src="${isAi ? bot : user}" 
              alt="${isAi ? 'bot' : 'user'}" />
          </div>
          <div class="message" id=${uniqueId}>${value}</div>
        </div>
      </div>
    `
  )
}

/**
 * When submit button
 * @param {event} e 
 */
const handleSubmit = async (e) => {
  e.preventDefault();

  const data = new FormData(form);

  //User's chat stripe
  chatContainer.innerHTML += chatStripe(false, data.get('prompt'));
  form.reset();

  //BotChat stripe
  const uniqueId = generateUniqueId();
  chatContainer.innerHTML += chatStripe(true, " ", uniqueId);
  chatContainer.scrollTop = chatContainer.scrollHeight;

  const messageDiv = document.getElementById(uniqueId);

  loader(messageDiv);

  //Fetch data from server
  const response = await fetch(serverApi, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      prompt: data.get('prompt')
    }),
  })

  //Clear interval and add empty string to message div
  clearInterval(loadInterval);
  messageDiv.innerHTML = '';

  if (response.ok) {
    const data = await response.json();
    const parsedData = data.bot.trim();

    typeText(messageDiv, parsedData);
  } else {
    const err = response.text();
    messageDiv.innerHTML = "Something went wrong!";
    console.log(err);
  }
}

/**
 * add event listners and callback functions in enterkey pressed
 */
form.addEventListener('submit', handleSubmit);
form.addEventListener('keyup', (e) => {
  if (e.keyCode === 13 && !e.shiftKey) {
    handleSubmit(e);
  }
})
