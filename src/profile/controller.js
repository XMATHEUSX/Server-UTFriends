const { config } = require("dotenv");
const configs = require("../../config");
const queries = require("./queries");
const jwt = require('jsonwebtoken');

const login = async (req, res) => {
  const { email: email, password } = req.body;
  try {
    const result = await configs.pool.query(queries.selectUser, [email, password]);

    if (result.rows.length > 0) {
      var token = jwt.sign(email, configs.segredo);
      res.json({
        success: true,
        token: token,
        message: "Login bem-sucedido.\nBem vindo " + result.rows[0].nickname,
      });
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
    const emailExistsResult = await configs.pool.query(queries.checkEmailExists, [
      email,
    ]);

    if (emailExistsResult.rows[0].exists) {
      return res
        .status(400)
        .json({ success: false, message: "O email já está em uso." });
    }

    const nicknameExistsResult = await configs.pool.query(queries.checkNicknameExists, [
      nickname,
    ]);

    if (nicknameExistsResult.rows[0].exists) {
      return res
        .status(400)
        .json({ success: false, message: "O nickname já está em uso." });
    }

    await configs.pool.query("BEGIN");

    const insertUserResult = await configs.pool.query(queries.insertUser, [
      email,
      name,
      password,
      "2002-07-08",
      6,
    ]);

    const userId = insertUserResult.rows[0].user_id;

    await configs.pool.query(queries.insertProfile, [userId, nickname]);
    await configs.pool.query("COMMIT");

    res.json({ success: true, message: "Registro bem-sucedido." });
  } catch (error) {
    console.error("Erro ao registrar no banco de dados:", error);

    await configs.pool.query("ROLLBACK");

    res
      .status(500)
      .json({ success: false, message: "Erro interno do servidor." });
  }
};

const userInfo = async (req, res) => {
  const {token} = req.body;
  if (token) {
    try {
      // Verificar e decodificar o token
      var dadosRecebidos = jwt.verify(token, configs.segredo);
      const result = await configs.pool.query(queries.selectUserId, [dadosRecebidos]);
      const result_new = await configs.pool.query(queries.selectProfile, [result.rows[0].user_id]);
      res.json({ 
        success: true,
        dados:result_new.rows[0]
      });
    } catch (error) {
      console.error('Erro na verificação do token:', error);
    }
  } else {
    console.error('Token não encontrado.');
  }
}

const healthCheck = async (req, res) => {
  try {
    await configs.pool.query("SELECT NOW()");
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
  userInfo,
  healthCheck,
  ok,
};
