const selectUser =
  'SELECT b.nickname FROM "conta" as a INNER JOIN perfil as b on a.user_id = b.user_id WHERE a.email = $1 AND a.senha=crypt($2,a.senha)';

const checkEmailExists =
  'SELECT EXISTS (SELECT 1 FROM "conta" WHERE email = $1)';

const checkNicknameExists =
  'SELECT EXISTS(SELECT 1 FROM "conta" WHERE nm_usuario = $1)';

const createUserId = 'SELECT user_id FROM conta order by user_id desc limit 1'

const insertUser =
  "INSERT INTO conta(user_id,email, nm_usuario, senha, telefone,dt_nascimento, curso_id) VALUES ($1,$2, $3, crypt($4, gen_salt('bf', 6)), $5, $6, $7)";

const insertProfile = "INSERT INTO perfil(user_id, nickname) VALUES ($1, $2)";

const selectUserId = 'SELECT user_id FROM "conta" WHERE email = $1'

const selectProfile = 'SELECT * FROM "perfil" WHERE user_id = $1'

const updateEmailVerify = "UPDATE conta SET email_verificado = true WHERE email = $1"


module.exports = {
  selectUser,
  checkEmailExists,
  checkNicknameExists,
  createUserId,
  insertUser,
  insertProfile,
  selectUserId,
  selectProfile,
  updateEmailVerify
};
