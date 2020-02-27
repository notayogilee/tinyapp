
// checks the users database for current users and returns user info if registered
//this is what I used in my TinyApp
const userCheck = function(users, email) {

  for (let id in users) {
    let user = users[id];
    if (email === user.email) {
      return user;
    }
  }
};

//This is for the assertion exercise
const getUserByEmail = function(email, users) {

  for (let id in users) {
    let user = users[id];
    if (email === user.email) {
      return user.id;
    }
  }
};

module.exports.userCheck = userCheck;
module.exports.getUserByEmail = getUserByEmail;