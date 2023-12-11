require("dotenv").config();
const queries = require("./queries");
const jwt = require("jsonwebtoken");
const configs = require("../../config");

const buscarFeed = async (req, res) => {
  const { token } = req.body;
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
};

const curtirPensamento = async (req, res) => {
  const { pensamento_id, user_info } = req.body;
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
};

const searchProfile = async (req, res) => {
  const { busca, token } = req.body;
  const userIdRecebido = jwt.verify(token, configs.segredo);
  const profiles = await queries.buscaNickname(busca);
  for (let i = 0; i < profiles.length; i++) {
    if (profiles[i].seguidores) {
      const seguidoresJson = JSON.stringify(profiles[i].seguidores, null,2);
      const seguidoresJsons = JSON.parse(seguidoresJson);
      for (let j = 0; j < seguidoresJsons.seguidores.length; j++) {
        if (seguidoresJsons.seguidores[j].user_id == userIdRecebido) {
          profiles[i].follow = true;
          break
        }else{
          profiles[i].follow = false;
        }
      }
  }
}
console.log(profiles)
  res.status(200).json({ success: true, profiles: profiles });
};

const seguirUsuario = async(req,res) => {
  const { token} = req.body;
  const userIdRecebido = jwt.verify(token, configs.segredo);
  queries.seguirUsuario(userIdRecebido,nickname)
}

const inserirPensamento = async (req, res) => {
  const { token, ds_pensamento } = req.body;
  const userIdRecebido = jwt.verify(token, configs.segredo);

  const pensamento = await queries.inserirPensamento(
    parseInt(userIdRecebido),
    ds_pensamento
  );
  if (pensamento) {
    console.log("Pensamento inserido com sucesso!");
    console.log(pensamento);
    res.status(200).json({ success: true, pensamento: pensamento });
  } else {
    res
      .status(401)
      .json({ success: false, message: "Erro ao inserir o pensamento." });
  }
};

module.exports = {
  buscarFeed,
  curtirPensamento,
  searchProfile,
  inserirPensamento,
  seguirUsuario,
};
