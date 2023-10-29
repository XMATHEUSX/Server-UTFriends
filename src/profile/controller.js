require("dotenv").config();
const queries = require("./queries");
const jwt = require("jsonwebtoken");
const Resend = require("resend");
const url = require("url");
const configs = require("../../config");
const querystring = require("querystring");

const login = async (req, res) => {
  const { email, password } = req.body;
  queries.prisma.$connect();
  try {
    const result = await queries.selectUser(email, password);
    if (result === null) {
      res
        .status(401)
        .json({ success: false, message: "Credenciais inválidas." });
    } else if (result.email_verificado) {
      var token = jwt.sign(email, configs.segredo);
      res.json({
        success: true,
        token: token,
        message:
          "Login bem-sucedido.\nBem vindo " +
          result.perfil_conta_user_idToperfil.nickname,
      });
    } else {
      res
        .status(401)
        .json({ success: false, message: "Email não verificado." });
    }
  } catch (error) {
    console.error("Erro ao consultar o banco de dados:", error);
    res
      .status(500)
      .json({ success: false, message: "Erro interno do servidor." });
  }

  queries.prisma.$disconnect();
};

const register = async (req, res) => {
  queries.prisma.$connect();
  const { name, email, password, nickname, telphone, birth, curso } = req.body;
  const resend = new Resend.Resend(process.env.RESEND_KEY);
  const lastUserId = await queries.findLastUserId();
  const user_id = lastUserId.user_id + 1;

  try {
    const emailExistsResult = await queries.checkEmailExists(email);

    if (emailExistsResult !== null) {
      return res
        .status(400)
        .json({ success: false, message: "O email já está em uso." });
    }

    const nicknameExistsResult = await queries.checkNicknameExists(
      nickname.toLowerCase()
    );
    if (nicknameExistsResult !== null) {
      return res
        .status(400)
        .json({ success: false, message: "O nickname já está em uso." });
    }

    await queries.insertUserProfile(
      user_id,
      email,
      name,
      password,
      telphone,
      birth + "T00:00:00.000Z",
      parseInt(curso),
      nickname.toLowerCase()
    );

    data = {
      time: Date.now,
      email: email,
      password: password,
    };

    // Obter o tempo atual em milissegundos
    var now = Date.now();

    // Calcular a hora de expiração adicionando uma hora (3600 segundos) ao tempo atual
    var expirationTime = now + 3600000; // 3600 segundos * 1000 milissegundos/segundo

    console.log(expirationTime);

    //Construa o token JWT
    token = jwt.sign(data, configs.segredo);
    console.log(token);
    resend.emails.send({
      from: "onboarding@resend.dev",
      to: "matheusxavier@alunos.utfpr.edu.br",
      subject: "Congratulations",
      html:
        "<p>email de verificação<strong>http://localhost:3000/api/v1/profile/verify?code=" +
        token +
        "</strong></p>",
    });
    res.json({ success: true, message: "Registro bem-sucedido." });
  } catch (error) {
    console.error("Erro ao registrar no banco de dados:", error);

    res
      .status(500)
      .json({ success: false, message: "Erro interno do servidor." });
  }

  queries.prisma.$disconnect();
};

const userInfo = async (req, res) => {
  const { token } = req.body;
  queries.prisma.$connect();
  if (token) {
    try {
      // Verificar e decodificar o token
      var emailRecebido = jwt.verify(token, configs.segredo);
      const userId = await queries.selectUserId(emailRecebido).userId;
      const dadosProfile = await queries.selectProfile(userId);
      res.json({
        success: true,
        dados: dadosProfile,
      });
    } catch (error) {
      console.error("Erro na verificação do token:", error);
    }
  } else {
    console.error("Token não encontrado.");
  }
  queries.prisma.$disconnect();
};

const verify = async (req, res) => {
  const parsedUrl = url.parse(req.url);

  // Parse dos parâmetros da string de consulta
  const params = querystring.parse(parsedUrl.query);

  //Todo Verificar a expirição
  const tokenVerify = params.code;
  var dadosRecebidos = jwt.verify(tokenVerify, configs.segredo);
  queries.prisma.$connect();
  await queries.updateEmailVerify(dadosRecebidos.email);
  queries.prisma.$disconnect();
};

const healthCheck = async (req, res) => {
  queries.prisma.$connect();
  try {
    await configs.pool.query("SELECT NOW()");
    res.json({ success: true, message: "Servidor rodando." });
  } catch (error) {
    console.error("Erro ao consultar o banco de dados:", error);
    return res.status(500).json({ success: false, message: error });
  }
  queries.prisma.$disconnect();
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
