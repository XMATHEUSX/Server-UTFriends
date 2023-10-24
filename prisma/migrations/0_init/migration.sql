-- CreateTable
CREATE TABLE "conta" (
    "user_id" SERIAL NOT NULL,
    "email" VARCHAR(60) NOT NULL,
    "nm_usuario" VARCHAR(100) NOT NULL,
    "senha" TEXT NOT NULL,
    "telefone" VARCHAR(15),
    "dt_nascimento" DATE NOT NULL,
    "curso_id" INTEGER,
    "email_verificado" BOOLEAN DEFAULT false,

    CONSTRAINT "conta_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "curso" (
    "curso_id" SERIAL NOT NULL,
    "nm_curso" VARCHAR(100),

    CONSTRAINT "curso_pkey" PRIMARY KEY ("curso_id")
);

-- CreateTable
CREATE TABLE "perfil" (
    "user_id" SERIAL NOT NULL,
    "nickname" VARCHAR(30) NOT NULL,
    "biografia" VARCHAR(256),
    "seguidores" JSON,
    "seguindo" JSON,

    CONSTRAINT "perfil_pkey" PRIMARY KEY ("user_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "conta_email_key" ON "conta"("email");

-- AddForeignKey
ALTER TABLE "conta" ADD CONSTRAINT "conta_curso_id_fkey" FOREIGN KEY ("curso_id") REFERENCES "curso"("curso_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "conta" ADD CONSTRAINT "conta_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "perfil"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "perfil" ADD CONSTRAINT "perfil_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "conta"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

