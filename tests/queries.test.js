const { insertUserProfile } = require("../src/profile/queries");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

describe("insertUserProfile", () => {
  beforeAll(async () => {
    await prisma.$connect();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("should insert a user profile", async () => {
    const user_id = 1;
    const email = "test@example.com";
    const nm_usuario = "Test User";
    const senha = "password";
    const telefone = "123456789";
    const dt_nascimento = new Date("1990-01-01");
    const curso_id = 1;
    const nickname = "testuser";

    await insertUserProfile(
      user_id,
      email,
      nm_usuario,
      senha,
      telefone,
      dt_nascimento,
      curso_id,
      nickname
    );

    const user = await prisma.conta.findUnique({
      where: { user_id },
      include: { perfil: true },
    });

    expect(user).toMatchObject({
      user_id,
      email,
      nm_usuario,
      senha,
      telefone,
      dt_nascimento,
      curso_id,
      perfil: { nickname },
    });
  });
});
