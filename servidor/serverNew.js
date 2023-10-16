const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');

const app = express();
const port = 3000; // Escolha a porta que desejar

// URL de conexão fornecida
const connectionString = 'postgres://myuedsffxgjcnh:1bceb88e89d80572e41ada4c42eed862096f13323229fbed65f95c6a7c4a9aca@ec2-3-215-195-210.compute-1.amazonaws.com:5432/d33md8vfudfkiq';

// Configuração da pool de conexões
const pool = new Pool({
  connectionString: connectionString,
  ssl: { rejectUnauthorized: false } // Necessário para conexões SSL em ambientes de produção
});

// Configurando o body-parser para processar o corpo das solicitações como JSON
app.use(bodyParser.json());


// Adicionando middleware cors para permitir solicitações de qualquer origem
app.use(cors());

app.post('/api/v1/profile/login', async (req, res) => {
    const {email, password } = req.body;

      // Aqui você pode adicionar a lógica de autenticação conforme necessário
      console.log('Usuário:', email);
      console.log('Senha:', password);
  
    try {
      // Consulta usando parâmetros preparados para proteger contra SQL injection
      
      const result = await pool.query('SELECT * FROM "conta" WHERE email = $1 AND senha=crypt($2,senha)', [email, password]);
      if (result.rows.length > 0) {
        // Usuário autenticado com sucesso
        var token = jwt.sign(email, 'segredo');
        res.json({ success: true,token: token, message: 'Login bem-sucedido.' });
      } else {
        // Credenciais inválidas
        res.status(401).json({ success: false, message: 'Credenciais inválidas.' });
      }
    } catch (error) {
      console.error('Erro ao consultar o banco de dados:', error);
      res.status(500).json({ success: false, message: 'Erro interno do servidor.' });
    }
  });

  app.post('/api/v1/profile//register', async (req, res) => {
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
        res.status(401).json({ success: false, message: 'Valores Repetidos.',email:result_email.rows[0],nickname:result_nickname.rows[0]});
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

  app.post('/api/v1/profile/user', async (req, res) => {
    const {token} = req.body;

      // Aqui você pode adicionar a lógica de autenticação conforme necessário
      console.log('Usuário:', token);
      
      if (token) {
        try {
          // Verificar e decodificar o token
          var dadosRecebidos = jwt.verify(token, 'segredo');
          const result = await pool.query('SELECT user_id FROM "conta" WHERE email = $1', [dadosRecebidos]);
          var n = result.rows[0].user_id
          console.log(n);
          const result_new = await pool.query('SELECT * FROM "perfil" WHERE user_id = $1', [n]);
          console.log(result_new.rows[0]);
          console.log("?????????????????")
          console.log({success: true,dados:result_new.rows[0]})
          res.json({ success: true,dados:result_new.rows[0]});
        } catch (error) {
          console.error('Erro na verificação do token:', error);
        }
      } else {
        console.error('Token não encontrado.');
      }
  });

  app.get('/now', async (req, res) => {
    const result = await pool.query('SELECT NOW()');
    console.log(result)
  });

  app.get('/conta', async (req, res) => {
    const result = await pool.query('SELECT * from conta where ');
    console.log(result)
  });

// Inicia o servidor na porta especificada
app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});

