const pool = require("../../database");
const queries = require("./queries");

const login = async (req, res) => {
  const { username, password } = req.body;

  console.log("Usuário:", username);
  console.log("Senha:", password);

  try {
    const result = await pool.query(queries.selectUser, [username, password]);

    if (result.rows.length > 0) {
      res.json({ success: true, message: "Login bem-sucedido." });
    } else {
      res
        .status(401)
        .json({ success: false, message: "Credenciais inválidas." });
    }
  } catch (error) {
    console.error("Erro ao consultar o banco de dados:", error);
    res
      .status(500)
      .json({ success: false, message: "Erro interno do servidor." });
  }
};

const register = async (req, res) => {
  const { name, email, password, nickname } = req.body;

  try {
    const emailExistsResult = await pool.query(queries.checkEmailExists, [
      email,
    ]);

    if (emailExistsResult.rows[0].exists) {
      return res
        .status(400)
        .json({ success: false, message: "O email já está em uso." });
    }

    const nicknameExistsResult = await pool.query(queries.checkNicknameExists, [
      nickname,
    ]);

    if (nicknameExistsResult.rows[0].exists) {
      return res
        .status(400)
        .json({ success: false, message: "O nickname já está em uso." });
    }

    await pool.query("BEGIN");

    const insertUserResult = await pool.query(queries.insertUser, [
      email,
      name,
      password,
      "2002-07-08",
      6,
    ]);

    const userId = insertUserResult.rows[0].user_id;

    await pool.query(queries.insertProfile, [userId, nickname]);
    await pool.query("COMMIT");

    res.json({ success: true, message: "Registro bem-sucedido." });
  } catch (error) {
    console.error("Erro ao registrar no banco de dados:", error);

    await pool.query("ROLLBACK");

    res
      .status(500)
      .json({ success: false, message: "Erro interno do servidor." });
  }
};

const healthCheck = async (req, res) => {
  try {
    await pool.query("SELECT NOW()");
    res.json({ success: true, message: "Servidor rodando." });
  } catch (error) {
    console.error("Erro ao consultar o banco de dados:", error);
    return res.status(500).json({ success: false, message: error });
  }
};

const ok = (req, res) => {
  try {
    return res.json({ success: true, message: "Ok!" });
  } catch (error) {
    return res.json({ success: false, message: error });
  }
};

module.exports = {
  login,
  register,
  healthCheck,
  ok,
};
