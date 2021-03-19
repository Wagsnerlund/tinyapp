const getUserByEmail = function (pEmail, database) {
  for (const user in database) {
    if (database[user].email === pEmail) {
      return database[user];
    }
  }
  return undefined;
};

module.exports = { getUserByEmail};