// connect to server
const server = io()

// Elements
const form = document.querySelector('#form');
const formInput = form.querySelector('#formInput');
const submitBtn = form.querySelector('#sendMessage');
const locationBtn = document.querySelector('#locationBtn')
const messages = document.querySelector('#messages')

// template
const messageTemplate = document.querySelector('#message-Template').innerHTML;
const locationTemplate = document.querySelector('#location-Template').innerHTML;
const chatAlertTemplate = document.querySelector('#chatAlert-Template').innerHTML;
const sidebarTemplate = document.querySelector('#sidebar-Template').innerHTML;

// Option - Using QueryString library
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix : true });

const AutoScroll = () => {
    
    // New Message element
    const $newMessage = messages.lastElementChild;

    // Height of new Message
    const newMessageStyles = getComputedStyle($newMessage);
    const newMessageMarginHeight = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMarginHeight;

    //Visible Height
    const visibleHeight = messages.offsetHeight

    // Height of messages container
    const containerHeight = messages.scrollHeight

    // How far have i scroll
    const scrollOffset = messages.scrollTop + visibleHeight;

    if(containerHeight - newMessageHeight <= scrollOffset)
    {
        messages.scrollTop = messages.scrollHeight;
    }
}

form.addEventListener('submit', (e) => 
{
    e.preventDefault();
    const message = e.target.elements.message.value;
    if(message !== "")
    {
        submitBtn.setAttribute('disabled','disabled');
        server.emit('Message', message, (error) => 
        {
            submitBtn.removeAttribute('disabled');
            formInput.value = '';
            formInput.focus();
            if(error)
            {
                return console.log(error);
            }
            console.log('Message Delivered');
        });
    }
})

locationBtn.addEventListener('click', () => {
    if(!navigator.geolocation)
    {
        alert('Geolocation is not supported by your browser')
    }
    locationBtn.setAttribute('disabled','disabled');
    navigator.geolocation.getCurrentPosition((position) => 
    {
        const location = {
            latitude : position.coords.latitude,
            longitude : position.coords.longitude
        }

        server.emit('SendLocation', location, (response) => 
        {
            locationBtn.removeAttribute('disabled');
            console.log("Location Shared : ", response)
        })
    })
})

server.on('WelcomeMessage', (msg) => 
{
    const html = Mustache.render(chatAlertTemplate, { 
        message : msg.username
    });
    messages.insertAdjacentHTML('beforeend', html);
    console.log(msg);
})

server.on('MessageAlert', (Message) => 
{
    const html = Mustache.render(messageTemplate, {
        Username : Message.username,
        message : Message.content,
        CreatedAt : moment(Message.createdAt).format('h:mm a')
    });
    messages.insertAdjacentHTML('beforeend', html);
    console.log(Message.content);
    AutoScroll();

})

server.on('LocationMessageAlert', (Location) => {
    const html = Mustache.render(locationTemplate, {
        Username : Location.username,
        currentLocation : Location.url, 
        CreatedAt : moment(Location.createdAt).format('h:mm a')
    })
    messages.insertAdjacentHTML('beforeend', html);
    AutoScroll();
})

server.on('RoomData', ({room, users}) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html;
})

server.emit("Join", {username, room}, (error) => {
    if(error)
    {
        alert(error)
        location.href = '/'
    }
})