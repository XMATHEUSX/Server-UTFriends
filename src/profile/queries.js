const selectUser =
  'SELECT * FROM "conta" WHERE nm_usuario = $1 AND senha=crypt($2,senha)';

const checkEmailExists =
  'SELECT EXISTS (SELECT 1 FROM "conta" WHERE email = $1)';

const checkNicknameExists =
  'SELECT EXISTS(SELECT 1 FROM "conta" WHERE nm_usuario = $1)';

const insertUser =
  "INSERT INTO conta(email, nm_usuario, senha, dt_nascimento, curso_id) VALUES ($1, $2, crypt($3, gen_salt('bf', 6)), $4, $5)";

const insertProfile = "INSERT INTO perfil(user_id, nickname) VALUES ($1, $2)";

module.exports = {
  selectUser,
  checkEmailExists,
  checkNicknameExists,
  insertUser,
  insertProfile,
};
