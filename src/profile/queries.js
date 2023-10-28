const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function selectUser(email, password) {
  const userEncryptedPass =
    await prisma.$queryRaw`SELECT senha from conta where email = ${email}`;
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

module.exports = {
  selectUser,
  checkEmailExists,
  checkNicknameExists,
  findLastUserId,
  insertUserProfile,
  selectUserId,
  selectProfile,
  updateEmailVerify,
};
