const users = []

const AddUser = ({ id, username, room}) => 
{
    username = username.trim().toLowerCase();
    room = room.trim().toLowerCase();

    if(!username || !room)
    {
        return {
            error : 'Username and room is required'
        }
    }

    const existingUser = users.find( user => {
        return user.room === room && user.username == username
    })

    if(existingUser)
    {
        return {
            error : 'Username already exist !'
        } 
    }

    const user = {id, username, room}
    users.push(user)
    return {user}
}

const RemoveUser = (id) => {
    const index = users.findIndex( user => user.id === id)
    if(index !== -1)
    {
        return users.splice(index, 1)[0]
    }
}

const GetUser = (id) => {
    return users.find( user => user.id === id);
}

const GetUsersInRoom = (room) => {
    const usersInRoom = users.filter( user => {
        return user.room === room
    })
    
    if(!usersInRoom)
    {
        return {
            error : 'No User found. Room is empty'
        }
    }
    return usersInRoom;
}

module.exports = {
    AddUser,
    RemoveUser,
    GetUser,
    GetUsersInRoom
}