
// checks the users database for current users and returns user info if registered
//this is what I used in my TinyApp
function userCheck(users, email) {

  for (let id in users) {
    let user = users[id];
    if (email === user.email) {
      return user;
    }
  }
}

//This is for the assertion exercise
function getUserByEmail(email, users) {

  for (let id in users) {
    let user = users[id];
    if (email === user.email) {
      return user.id;
    }
  }
  // return false;
}
module.exports.userCheck = userCheck;
module.exports.getUserByEmail = getUserByEmail;