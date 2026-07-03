 const USERS = [
    {id: 'u1', username:'admin', password:'1234', name:'관리자'},
    {id: 'u3', username:'test', password:'test', name:'테스트계정'},
 ]

 function findUser(username, password) {
    return USERS.find((u)=> u.username === username && u.password === password) || null;
}

module.exports = {findUser};