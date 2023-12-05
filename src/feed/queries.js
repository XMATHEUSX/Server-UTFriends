const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function pensamento(user_id, ds_pensamento, tipo_pensamento) {
  const coments_json = { comentarios: [] };
  const curtidas_json = { curtidas: [] };

  const totalPensamentosUser = await totalPensamentos(user_id);

  return prisma.pensamentos.create({
    data: {
      pensamento_id: user_id * 1000 + (totalPensamentosUser + 1),
      user_id: user_id,
      ds_pensamento: ds_pensamento,
      tipo_pensamento: tipo_pensamento,
      comentarios: coments_json,
      curtidas: curtidas_json,
    },
  });
}

async function totalPensamentos(user_id) {
  return prisma.pensamentos.count({
    where: {
      user_id: user_id,
    },
  });
}

async function inserirComentario(pensamento_id, comentario) {
  const pensamento = await prisma.pensamentos.findFirst({
    where: {
      pensamento_id: pensamento_id,
    },
  });
  if (pensamento?.comentarios && typeof pensamento?.comentarios === "object") {
    const comentarios = pensamento?.comentarios;

    comentarios.comentarios.push(comentario);
    return prisma.pensamentos.update({
      where: {
        pensamento_id: pensamento_id,
      },
      data: {
        comentarios: comentarios,
      },
    });
  } else {
    return null;
  }
}

async function exibirComentarios(pensamento_id) {
  const pensamento = await prisma.pensamentos.findFirst({
    where: {
      pensamento_id: pensamento_id,
    },
  });
  if (pensamento?.comentarios && typeof pensamento?.comentarios === "object") {
    return pensamento?.comentarios.comentarios;
  } else {
    return null;
  }
}

async function quantidadeComentarios(pensamento_id) {
  const pensamento = await prisma.pensamentos.findFirst({
    where: {
      pensamento_id: pensamento_id,
    },
  });

  if (pensamento?.comentarios && typeof pensamento?.comentarios === "object") {
    return pensamento?.comentarios.comentarios.length;
  } else {
    return null;
  }
}

async function curtirPensamento(pensamento_id, user_info) {
  const pensamento = await prisma.pensamentos.findFirst({
    where: {
      pensamento_id: pensamento_id,
    },
  });

  if (pensamento?.curtidas && typeof pensamento?.curtidas === "object") {
    const curtidas = pensamento?.curtidas;
    const curtiu = curtidas.curtidas.some(
      (item) => item.user_id === user_info.user_id
    );

    if (curtiu) {
      curtidas.curtidas = curtidas.curtidas.filter(
        (item) => item.user_id !== user_info.user_id
      );
      return prisma.pensamentos.update({
        where: {
          pensamento_id: pensamento_id,
        },
        data: {
          curtidas: curtidas,
        },
      });
    } else {
      curtidas.curtidas.push(user_info);
      return prisma.pensamentos.update({
        where: {
          pensamento_id: pensamento_id,
        },
        data: {
          curtidas: curtidas,
        },
      });
    }
  }
}

async function exibirCurtidas(pensamento_id) {
  const pensamento = await prisma.pensamentos.findFirst({
    where: {
      pensamento_id: pensamento_id,
    },
  });
  if (pensamento?.curtidas && typeof pensamento?.curtidas === "object") {
    return pensamento?.curtidas.curtidas;
  } else {
    return null;
  }
}

async function quantidadeCurtidas(pensamento_id) {
  const pensamento = await prisma.pensamentos.findFirst({
    where: {
      pensamento_id: pensamento_id,
    },
  });
  if (pensamento?.curtidas && typeof pensamento?.curtidas === "object") {
    return pensamento?.curtidas.curtidas.length;
  } else {
    return null;
  }
}

async function exibirPensamentos(user_id) {
  return prisma.pensamentos.findMany({
    where: {
      user_id: user_id,
    },
  });
}

async function meuFeed(user_id) {
  return prisma.feed.findMany({
    where: {
      meu_id: user_id,
    },
  });
}

module.exports = {
  pensamento,
  inserirComentario,
  exibirComentarios,
  quantidadeComentarios,
  curtirPensamento,
  exibirCurtidas,
  quantidadeCurtidas,
  exibirPensamentos,
  meuFeed,
  prisma,
};
