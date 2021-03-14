const GenerateMessage = (username, msg) => {
    return {
        username,
        content : msg,
        createdAt : new Date().getTime()
    }
}

const GenerateLocationMessage = (username, url) => {
    return {
        username,
        url,
        createdAt : new Date().getTime()
    }
}

module.exports = {
    GenerateMessage,
    GenerateLocationMessage
}