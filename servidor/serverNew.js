const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
const port = 3000; // Escolha a porta que desejar

// Configurações do banco de dados
const pool = new Pool({
    user: 'postgres',
    host: '192.168.3.10',
    database: 'UTFriends',
    password: 'killerbee1472',
    port: 5432, // Porta padrão do PostgreSQL
  });

// Configurando o body-parser para processar o corpo das solicitações como JSON
app.use(bodyParser.json());


// Adicionando middleware cors para permitir solicitações de qualquer origem
app.use(cors());

app.post('/login', async (req, res) => {
    const { username, password } = req.body;

      // Aqui você pode adicionar a lógica de autenticação conforme necessário
      console.log('Usuário:', username);
      console.log('Senha:', password);
  
    try {
      // Consulta usando parâmetros preparados para proteger contra SQL injection
      
      const result = await pool.query('SELECT * FROM "conta" WHERE nm_usuario = $1 AND senha=crypt($2\,senha)', [username, password]);

      if (result.rows.length > 0) {
        // Usuário autenticado com sucesso
        res.json({ success: true, message: 'Login bem-sucedido.' });
      } else {
        // Credenciais inválidas
        res.status(401).json({ success: false, message: 'Credenciais inválidas.' });
      }
    } catch (error) {
      console.error('Erro ao consultar o banco de dados:', error);
      res.status(500).json({ success: false, message: 'Erro interno do servidor.' });
    }
  });

  app.post('/register', async (req, res) => {
    const { name, surname, email, password, nickname } = req.body;

      let user_id_next = await pool.query('SELECT user_id FROM conta order by user_id desc limit 1'); 
      const key_id = (user_id_next.rows[0].user_id)+1;
    try {
      // Consulta usando parâmetros preparados para proteger contra SQL injection
      const result_email = await pool.query('SELECT EXISTS (SELECT 1 FROM "conta" WHERE email = $1)', [email]);
      const result_nickname = await pool.query('SELECT EXISTS (SELECT 1 FROM "perfil" WHERE nickname = $1)', [nickname]);
      console.log('Resultado_email:', result_email.rows[0]);
      console.log('Resultado_nickname:', result_nickname.rows[0]);
      
      if (result_email.rows == false || result_nickname.rows == false ){
        res.status(401).json({ success: false, message: 'Valores Repetidos.',email:result_email.rows[0],nickname:result_nickname.rows});
      } else {
        await pool.query('BEGIN');
            const result_conta =  await pool.query('INSERT INTO conta(email, nm_usuario, senha, dt_nascimento, curso_id) VALUES ($1, $2, crypt($3, gen_salt(\'bf\', 6)), $4, $5)',[email, name, password, '2002-07-08', 6]);
            const result_perfil =  await pool.query('INSERT INTO perfil(user_id, nickname) VALUES ($1, $2)',[key_id, nickname]);
            await pool.query('COMMIT');
            res.json({ success: true, message: 'Login bem-sucedido.' });
      }
    /*
      if (result.rows.length > 0) {
        // Usuário autenticado com sucesso
        res.json({ success: true, message: 'Login bem-sucedido.' });
      } else {
        // Credenciais inválidas
        res.status(401).json({ success: false, message: 'Credenciais inválidas.' });
      }*/
    } catch (error) {
      console.error('Erro ao consultar o banco de dados:', error);
      res.status(500).json({ success: false, message: 'Erro interno do servidores.' });
      await client.query('ROLLBACK');
    }
  });

// Inicia o servidor na porta especificada
app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});

