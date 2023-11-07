const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function selectUser(email, password) {
  const user = await prisma.$queryRaw`
    SELECT 
      c.user_id, nickname, email_verificado
    FROM 
      conta c
    INNER JOIN 
      perfil ON c.user_id = perfil.user_id
    WHERE 
      email = ${email} AND senha = crypt(${password}, senha) LIMIT 1`;

  if (user[0]) {
    return user[0];
  }
  return null;
}

async function checkEmailExists(email) {
  return prisma.conta.findFirst({
    where: {
      email: email,
    },
  });
}

async function checkNicknameExists(nickname) {
  return prisma.perfil.findFirst({
    where: {
      nickname: nickname,
    },
  });
}

async function findLastUserId() {
  return prisma.conta.findFirst({
    orderBy: {
      user_id: "desc",
    },
    select: {
      user_id: true,
    },
  });
}

async function insertUserProfile(
  user_id,
  email,
  nm_usuario,
  senha,
  telefone,
  dt_nascimento,
  curso_id,
  nickname
) {
  const crypt_senha =
    await prisma.$queryRaw`SELECT crypt(${senha}, gen_salt('bf'))`;
  const seguindo_json = { seguindo: [] };
  const seguidores_json = { seguidores: [] };

  await prisma.$transaction([
    prisma.conta.create({
      data: {
        user_id: user_id,
        email: email,
        nm_usuario: nm_usuario,
        senha: crypt_senha[0].crypt,
        telefone: telefone,
        dt_nascimento: dt_nascimento,
        curso_id: curso_id,
      },
    }),
    prisma.perfil.create({
      data: {
        user_id: user_id,
        nickname: nickname,
        seguindo: seguindo_json,
        seguidores: seguidores_json,
      },
    }),
  ]);
}

async function selectUserId(email) {
  return prisma.conta.findFirst({
    where: {
      email: email,
    },
    select: {
      user_id: true,
    },
  });
}

async function selectProfile(user_id) {
  return prisma.perfil.findFirst({
    where: {
      user_id: user_id,
    },
  });
}

async function selectProfileFull(user_id) {
  let perfilData = await prisma.fullprofile.findFirst({
    where: {
      user_id: user_id,
    },
  });

  if (perfilData) {
    return perfilData;
  }
  return null;
}

async function updateEmailVerify(email) {
  return prisma.conta.update({
    where: {
      email: email,
    },
    data: {
      email_verificado: true,
    },
  });
}

async function deleteUser(email, user_id) {
  return await prisma.$transaction([
    prisma.conta.delete({
      where: {
        email: email,
      },
    }),
    prisma.perfil.delete({
      where: {
        user_id: user_id,
      },
    }),
  ]);
}

async function quantidadeSeguidores(user_id) {
  const perfil = await prisma.perfil.findFirst({
    where: {
      user_id: user_id,
    },
  });

  if (perfil?.seguidores && typeof perfil?.seguidores === "object") {
    return perfil?.seguidores.seguidores.length;
  } else {
    return null;
  }
}

async function quantidadeSeguindo(user_id) {
  const perfil = await prisma.perfil.findFirst({
    where: {
      user_id: user_id,
    },
  });
  if (perfil?.seguindo && typeof perfil?.seguindo === "object") {
    return perfil?.seguindo.seguindo.length;
  } else {
    return null;
  }
}

async function quantidadePensamentos(user_id) {
  return await prisma.pensamentos.count({
    where: {
      user_id: user_id,
    },
  });
}

async function updateNickname(user_id, nickname) {
  return await prisma.perfil.update({
    where: {
      user_id: user_id,
    },
    data: {
      nickname: nickname,
    },
  });
}

async function updateBio(user_id, bio) {
  return await prisma.perfil.update({
    where: {
      user_id: user_id,
    },
    data: {
      biografia: bio,
    },
  });
}

module.exports = {
  prisma,
  selectUser,
  checkEmailExists,
  checkNicknameExists,
  findLastUserId,
  insertUserProfile,
  selectUserId,
  selectProfile,
  selectProfileFull,
  updateEmailVerify,
  updateBio,
  updateNickname,
  deleteUser,
};
