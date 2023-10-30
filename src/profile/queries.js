const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function selectUser(email, password) {
  const userEncryptedPass =
    await prisma.$queryRaw`SELECT senha from conta where email = ${email}`;
  if (userEncryptedPass.length === 0) {
    return null;
  }
  const decryptedPass =
    await prisma.$queryRaw`SELECT crypt(${password}, ${userEncryptedPass[0].senha})`;

  return prisma.conta.findFirst({
    where: {
      email: email,
      senha: decryptedPass[0].crypt,
    },
    select: {
      email_verificado: true,
      senha: true,
      perfil_conta_user_idToperfil: {
        select: {
          nickname: true,
        },
      },
    },
  });
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
  const seguidores = await quantidadeSeguidores(user_id);
  const seguindo = await quantidadeSeguindo(user_id);
  const pensamentos = await quantidadePensamentos(user_id);
  let perfilData = await prisma.conta.findFirst({
    where: {
      user_id: user_id,
    },
    select: {
      perfil_conta_user_idToperfil: {
        select: {
          nickname: true,
          biografia: true,
        },
      },
    },
  });

  if (perfilData) {
    const perfil = perfilData.perfil_conta_user_idToperfil;
    perfil.seguidores = seguidores;
    perfil.seguindo = seguindo;
    perfil.pensamentos = pensamentos;
    return perfil;
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
  deleteUser,
};
