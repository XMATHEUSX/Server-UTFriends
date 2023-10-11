const selectUser =
  'SELECT b.nickname FROM "conta" as a INNER JOIN perfil as b on a.user_id = b.user_id WHERE a.email = $1 AND a.senha=crypt($2,a.senha)';

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
