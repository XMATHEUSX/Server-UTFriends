require("dotenv").config();
const queries = require("./queries");
const jwt = require("jsonwebtoken");
const configs = require("../../config");

const getFeed = async (req, res) => {
  const { token } = req.body;
  queries.prisma.$connect();
  if (token) {
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
  } else {
    res.status(400).json({ success: false, message: "UserId não informado." }); // Bad request
  }
  queries.prisma.$disconnect();
};

module.exports = {
  getFeed,
};
