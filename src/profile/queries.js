const selectUser =
  'SELECT * FROM "conta" WHERE nm_usuario = $1 AND senha=crypt($2,senha)';

const checkEmailExists = 0;
const checkNicknameExists = 0;
const insertUser = 0;
const insertProfile = 0;

module.exports = {
  selectUser,
  checkEmailExists,
  checkNicknameExists,
  insertUser,
  insertProfile,
};
