require("dotenv").config();
const queries = require("./queries");
const jwt = require("jsonwebtoken");
const configs = require("../../config");

const buscarFeed = async (req, res) => {
  const { token } = req.body;
  queries.prisma.$connect();
  try {
    const userIdRecebido = jwt.verify(token, configs.segredo);
    const feed = await queries.meuFeed(parseInt(userIdRecebido));
    if (feed) {
      res.status(200).json({ success: true, feed: feed });
    } else {
      res
        .status(401)
        .json({ success: false, message: "Erro ao carregar o feed." });
    }
  } catch (error) {
    console.error("Erro ao consultar o banco de dados:", error);
    res
      .status(500)
      .json({ success: false, message: "Erro interno do servidor." });
  }

  queries.prisma.$disconnect();
};

const curtirPensamento = async (req, res) => {
  const { pensamento_id, user_info } = req.body;
  queries.prisma.$connect();
  if (pensamento_id) {
    try {
      const curtida = await queries.curtirPensamento(
        parseInt(pensamento_id),
        user_info
      );
      if (curtida) {
        res.status(200).json({ success: true, curtida: curtida });
      } else {
        res
          .status(401)
          .json({ success: false, message: "Erro ao curtir o pensamento." });
      }
    } catch (error) {
      console.error("Erro ao consultar o banco de dados:", error);
      res
        .status(500)
        .json({ success: false, message: "Erro interno do servidor." });
    }
  } else {
    res.status(400).json({
      success: false,
      message: "UserId ou pensamento_id não informado.",
    });
  }
  queries.prisma.$disconnect();
};

const exibirMeusPensamentos = async (req, res) => {
  queries.prisma.$connect();
  try {
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

const searchProfile = async (req, res) => {
  const { busca } = req.body;
  queries.prisma.$connect();
  const profiles = await queries.buscaNickname(busca);
  console.log(profiles);
  res.status(200).json({ success: true, profiles: profiles });
};

module.exports = {
  buscarFeed,
  curtirPensamento,
  exibirMeusPensamentos,
  searchProfile,
};
