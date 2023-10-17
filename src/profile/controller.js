const { config } = require("dotenv");
const configs = require("../../config");
const queries = require("./queries");
const jwt = require('jsonwebtoken');
const Resend = require('resend');
const url = require('url');
const querystring = require('querystring');


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
  const { name, email, password, nickname,telphone,birth,curso } = req.body;
  const resend = new Resend.Resend('re_SnxCwaJY_9xB6YrMp2xf4mDQYMXts39uh');
  const userIdNext = await configs.pool.query(queries.createUserId); 
  const keyId = (userIdNext.rows[0].user_id)+1;
  console.log(name+"\n"+email+"\n"+password+"\n"+nickname+"\n"+telphone+"\n"+birth+"\n"+curso)
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
      keyId,
      email,
      name,
      password,
      telphone,
      birth,
      curso
    ]);
    await configs.pool.query(queries.insertProfile, [keyId, nickname]);
    await configs.pool.query("COMMIT");
    
    data = {
      "time": Date.now,
      "email": email,
      "password": password
    }

  // Obter o tempo atual em milissegundos
var now = Date.now();

// Calcular a hora de expiração adicionando uma hora (3600 segundos) ao tempo atual
var expirationTime = now + 3600000; // 3600 segundos * 1000 milissegundos/segundo

console.log(expirationTime);

    
    //Construa o token JWT
    token = jwt.sign(data, configs.segredo)
    console.log(token)
    resend.emails.send({
      from: 'onboarding@resend.dev',
      to: 'matheusxavier@alunos.utfpr.edu.br',
      subject: 'Congratulations',
      html: '<p>email de verificação<strong>http://localhost:3000/api/v1/profile/verify?code='+token+'</strong></p>'
    });
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


const verify = async (req, res) => {
 
  const parsedUrl = url.parse(req.url);
  
  // Parse dos parâmetros da string de consulta
  const params = querystring.parse(parsedUrl.query);
  
  //Todo Verificar a expirição
  const tokenVerify = params.code;
  var dadosRecebidos = jwt.verify(tokenVerify, configs.segredo);
  const result = await configs.pool.query(queries.updateEmailVerify, [dadosRecebidos.email]);
};

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
  verify,
  healthCheck,
  ok,
};
