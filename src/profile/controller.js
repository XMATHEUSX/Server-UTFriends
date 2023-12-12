require("dotenv").config();
const queries = require("./queries");
const jwt = require("jsonwebtoken");
const Resend = require("resend");
const configs = require("../../config");
const { emit } = require("process");
const resend = new Resend.Resend(process.env.RESEND_KEY);

const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    console.log(email, password);
    const user = await queries.selectUser(email, password);
    console.log(user);
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
      // console.log(user.user_id)
      data = {
        time: Date.now,
        email: email,
        user_id: user.user_id,
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
  await queries.prisma.$connect();
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
      user_id: user.user_id,
    };

    // Obter o tempo atual em milissegundos
    var now = Date.now();

    // Calcular a hora de expiração adicionando uma hora (3600 segundos) ao tempo atual
    var expirationTime = now + 3600000; // 3600 segundos * 1000 milissegundos/segundo

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

  await queries.prisma.$disconnect();
};

const userInfo = async (req, res) => {
  const { token } = req.body;
  await queries.prisma.$connect();
  if (token) {
    try {
      // Verificar e decodificar o token
      //Todo verificar o porque esta fazendo diversas requests
      console.log(token);
      var userIdRecebido = jwt.verify(token, configs.segredo);
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
  await queries.prisma.$disconnect();
};

const userSearch = async (req, res) => {
  const { nickname } = req.body;
  await queries.prisma.$connect();
  if (nickname) {
    try {
      //Todo verificar o porque esta fazendo diversas requests
      const id = await queries.selectUserNickname(nickname);
      console.log(nickname, id.user_id);
      user = await queries.selectProfileFull(id.user_id);
      pensamentos = await queries.exibirMeusPensamentos(id.user_id);
      console.log(user);
      console.log("Pensamenots:", pensamentos);

      full_profile = {
        perfil: user,
        pensamentos: pensamentos,
      };

      res.json({
        success: true,
        dados: full_profile,
      });
    } catch (error) {
      console.error("Erro na passagem do id:", error);
    }
  } else {
    console.error("id não encontrado.");
  }
  await queries.prisma.$disconnect();
};

const infoConta = async (req, res) => {
  const { token } = req.body;
  var dadosRecebidos = jwt.verify(token, configs.segredo);
  queries.prisma.$connect();
  const info = await queries.infoConta(parseInt(dadosRecebidos));
  // console.log(info);
  queries.prisma.$disconnect();
  res.status(200).json({ success: true, info: info });
};

const verify = async (req, res) => {
  const { token } = req.body;
  var dadosRecebidos = jwt.verify(token, configs.segredo);
  queries.prisma.$connect();
  await queries.updateEmailVerify(dadosRecebidos.email);
  queries.prisma.$disconnect();
};

const verifyPassword = async (req, res) => {
  const { token, passwordAtual, passwordNovo } = req.body;
  try {
    var userId = jwt.verify(token, configs.segredo);
    await queries.prisma.$connect();
    user = await queries.verifyPassword(parseInt(userId), passwordAtual);
    if (user != null) {
      await queries.updatePasswordToken(parseInt(userId), passwordNovo);
      res.status(200).json({ success: true });
    } else {
      res.status(401).json({ success: false, message: "senha errada." });
    }
  } catch (error) {
    console.error("Erro ao consultar o banco de dados:", error);
    res
      .status(500)
      .json({ success: false, message: "Erro interno do servidor." });
  }
};

const deleteUser = async (req, res) => {
  const { token } = req.body;
  var dadosRecebidos = jwt.verify(token, configs.segredo);
  // console.log(dadosRecebidos);
  queries.prisma.$connect();
  await queries.deleteUser(parseInt(dadosRecebidos));
  res.status(200).json({ success: true });
  queries.prisma.$disconnect();
};

const update = async (req, res) => {
  const { nick, bio, curso, token } = req.body;
  try {
    var user_id = jwt.verify(token, configs.segredo);
    if (nick) {
      await queries.updateNickname(parseInt(user_id), nick);
    }
    if (bio) {
      await queries.updateBio(parseInt(user_id), bio);
    }

    if (curso) {
      await queries.updateCurso(parseInt(user_id), parseInt(curso));
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
  await queries.prisma.$connect();
  const { token, password } = req.body;
  var email = jwt.verify(token, configs.segredo);
  // console.log(password);
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


const followUser = async (req, res) => {
  await queries.prisma.$connect();
  const { nicknameFollower,nicknameFollowed, follow} = req.body;
  try{
  const idFollower = await queries.selectUserNickname(nicknameFollower);
  const idFollowed = await queries.selectUserNickname(nicknameFollowed);
  console.log(idFollower.user_id,nicknameFollower,idFollowed.user_id,nicknameFollowed,follow)
  await queries.followUser(idFollower.user_id,nicknameFollower,idFollowed.user_id,nicknameFollowed,follow)
  }
  catch (error) {
    console.error("Erro ao registrar no banco de dados:", error);

    res
      .status(500)
      .json({ success: false, message: "Erro interno do servidor." });
  }
  await queries.prisma.$disconnect();
}

const forgetPassword = async (req, res) => {
  await queries.prisma.$connect();
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

const exibirMeusPensamentos = async (req, res) => {
  await queries.prisma.$connect();
  const { token } = req.body;
  try {
    const userIdRecebido = jwt.verify(token, configs.segredo);
    const pensamentos = await queries.exibirMeusPensamentos(
      parseInt(userIdRecebido)
    );
    if (pensamentos) {
      res.status(200).json({ success: true, pensamentos: pensamentos });
    } else {
      res.status(401).json({
        success: false,
        message: "Erro ao carregar os pensamentos.",
      });
    }
  } catch (error) {
    console.error("Erro ao consultar o banco de dados:", error);
    res
      .status(500)
      .json({ success: false, message: "Erro interno do servidor." });
  }
  queries.prisma.$disconnect();
};

const healthCheck = async (req, res) => {
  await queries.prisma.$connect();
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
  infoConta,
  verify,
  deleteUser,
  update,
  userSearch,
  updatePassword,
  followUser,
  forgetPassword,
  verifyPassword,
  healthCheck,
  exibirMeusPensamentos,
  ok,
};
