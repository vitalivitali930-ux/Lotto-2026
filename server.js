const express = require('express');
const { Client } = require('ssh2');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/exec', (req, res) => {
    const { host, port, username, command } = req.body;
    let { privateKey } = req.body;

    if (!privateKey) {
        try {
            const keyPath = path.join(process.env.HOME, '.ssh', 'id_rsa');
            if (fs.existsSync(keyPath)) {
                privateKey = fs.readFileSync(keyPath, 'utf8');
            }
        } catch (e) {}
    }

    if (!host || !username || !command) {
        return res.json({ output: 'Ошибка: Заполни Host, Username и Command!' });
    }

    if (privateKey) {
        privateKey = privateKey.trim();
    }

    const conn = new Client();
    let outputData = '';

    conn.on('ready', () => {
        conn.exec(command, (err, stream) => {
            if (err) {
                conn.end();
                return res.json({ output: `Ошибка выполнения: ${err.message}` });
            }
            stream.on('data', (data) => {
                outputData += data.toString();
            }).stderr.on('data', (data) => {
                outputData += data.toString();
            }).on('close', () => {
                conn.end();
                res.json({ output: outputData });
            });
        });
    }).on('error', (err) => {
        res.json({ output: `Ошибка SSH соединения: ${err.message}` });
    }).connect({
        host: host,
        port: parseInt(port) || 22,
        username: username,
        privateKey: privateKey ? privateKey : undefined,
        readyTimeout: 15000
    });
});

app.listen(3000, () => {
    console.log('Zero App запущен: http://localhost:3000');
});
