require("dotenv").config();
const queries = require("./queries");
const jwt = require("jsonwebtoken");
const Resend = require("resend");
const url = require("url");
const configs = require("../../config");
const querystring = require("querystring");
const { emit } = require("process");
const resend = new Resend.Resend(process.env.RESEND_KEY);

const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await queries.selectUser(email, password);
    if (user === null) {
      res
        .status(401)
        .json({ success: false, message: "Credenciais inválidas." });
    } else if (user.email_verificado) {
      //TODO ao invés de pegar só o email pegar a senha também
      var token = jwt.sign(user.user_id, configs.segredo);
      res.json({
        success: true,
        token: token,
        message: "Login bem-sucedido.\nBem vindo " + user.nickname,
      });
    } else {
      data = {
        time: Date.now,
        email: email,
      };
      token = jwt.sign(data, configs.segredo);
      resend.emails.send({
        from: "onboarding@resend.dev",
        to: "matheusxavier@alunos.utfpr.edu.br",
        subject: "Congratulations",
        html:
          "<p>email de verificação<strong>http://localhost:5173/EmailConfirmed?code=" +
          token +
          "</strong></p>",
      });
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
    resend.emails.send({
      from: "onboarding@resend.dev",
      to: "matheusxavier@alunos.utfpr.edu.br",
      subject: "Congratulations",
      html:
        "<p>email de verificação<strong>http://localhost:5173/EmailConfirmed?code=" +
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
      //Todo verificar o porque esta fazendo diversas requests
      var userIdRecebido = jwt.verify(token, configs.segredo);
      console.log(userIdRecebido)
      user = await queries.selectProfileFull(parseInt(userIdRecebido));
      res.json({
        success: true,
        dados: user,
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
  const { token} = req.body;
  console.log("aqui")
  var dadosRecebidos = jwt.verify(token, configs.segredo);
  queries.prisma.$connect();
  await queries.updateEmailVerify(dadosRecebidos.email);
  queries.prisma.$disconnect();
};

const update = async (req, res) => {
  const { nick, bio, token } = req.body;
  try {
    var user_id = jwt.verify(token, configs.segredo);
    if (nick) {
      await queries.updateNickname(parseInt(user_id), nick);
    }
    if (bio) {
      await queries.updateBio(parseInt(user_id), bio);
    }

    res.json({ success: true, message: "Update bem-sucedido." });
  } catch (error) {
    console.error("Erro ao registrar no banco de dados:", error);

    res
      .status(500)
      .json({ success: false, message: "Erro interno do servidor." });
  }
};

const updatePassword = async (req, res) => {
  queries.prisma.$connect();
  const { token, password } = req.body;
  var email = jwt.verify(token, configs.segredo);
  console.log(password);
  try {
    await queries.updatePassword(email, password);

    res.json({ success: true, message: "Update bem-sucedido." });
  } catch (error) {
    console.error("Erro ao registrar no banco de dados:", error);

    res
      .status(500)
      .json({ success: false, message: "Erro interno do servidor." });
  }

  queries.prisma.$disconnect();
};

const forgetPassword = async (req, res) => {
  queries.prisma.$connect();
  const { email } = req.body;
  try {
    const emailExistsResult = await queries.checkEmailExists(email);

    if (emailExistsResult === null) {
      return res.status(400).json({
        success: false,
        message: "O email não esta cadastrado no sistema",
      });
    }
    //Construa o token JWT
    token = jwt.sign(email, configs.segredo);
    console.log(token);
    resend.emails.send({
      from: "onboarding@resend.dev",
      to: "matheusxavier@alunos.utfpr.edu.br",
      subject: "Congratulations",
      html:
        "<p> \n Troca de senha <br> <strong>http://localhost:5173/NewPassword?code=" +
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
  update,
  updatePassword,
  forgetPassword,
  healthCheck,
  ok,
};
