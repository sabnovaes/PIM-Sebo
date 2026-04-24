const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const app = express();

app.use(express.json());
app.use(cors());
app.use(express.static('public'));

// CONFIGURAÇÃO DO BANCO (Quando você tiver o banco online, mudaremos aqui)
const dbConfig = { host: 'localhost', user: 'root', password: 'unippim', database: 'SeboDB' };

// LISTAR LIVROS
app.get('/livros', async (req, res) => {
    try {
        const conn = await mysql.createConnection(dbConfig);
        const [rows] = await conn.execute('SELECT * FROM Produtos ORDER BY id DESC');
        await conn.end();
        res.json(rows);
    } catch (e) { res.status(500).send(e.message); }
});

// ENVIAR PROPOSTA OU LIVRO
app.post('/livros', async (req, res) => {
    try {
        const { titulo, estoque, preco, imagem } = req.body;
        const conn = await mysql.createConnection(dbConfig);
        await conn.execute('INSERT INTO Produtos (titulo, categoria, estoque, preco, imagem) VALUES (?, "Geral", ?, ?, ?)', [titulo, estoque, preco, imagem]);
        await conn.end();
        res.status(201).send("OK");
    } catch (e) { res.status(500).send(e.message); }
});

// APROVAR PROPOSTA
app.put('/aprovar-livro/:id', async (req, res) => {
    try {
        const conn = await mysql.createConnection(dbConfig);
        const sql = "UPDATE Produtos SET titulo = REPLACE(titulo, '(PROPOSTA CLIENTE) ', '') WHERE id = ?";
        await conn.execute(sql, [req.params.id]);
        await conn.end();
        res.send("OK");
    } catch (e) { res.status(500).send(e.message); }
});

// PEDIDOS
app.post('/pedidos', async (req, res) => {
    try {
        const { usuario_id, cliente_nome, total, itens, forma_pagamento } = req.body;
        const conn = await mysql.createConnection(dbConfig);
        const sql = 'INSERT INTO Pedidos (usuario_id, cliente_nome, total, itens, forma_pagamento, status) VALUES (?,?,?,?,?,"Pendente")';
        await conn.execute(sql, [usuario_id, cliente_nome, total, itens, forma_pagamento]);
        await conn.end();
        res.status(201).send("OK");
    } catch (e) { res.status(500).send(e.message); }
});

app.get('/pedidos', async (req, res) => {
    const conn = await mysql.createConnection(dbConfig);
    const [rows] = await conn.execute('SELECT * FROM Pedidos ORDER BY id DESC');
    await conn.end();
    res.json(rows);
});

// LINHA ALTERADA PARA FUNCIONAR NA REDE
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));