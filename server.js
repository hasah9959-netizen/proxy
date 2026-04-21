const http = require('http');
const net = require('net');

// Server web pancingan agar Render mendeteksi aplikasi hidup
const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Terowongan Proxy Aktif!\n');
});

// Mesin utama untuk membelokkan lalu lintas (HTTP CONNECT)
server.on('connect', (req, clientSocket, head) => {
    const [hostname, port] = req.url.split(':');
    const targetPort = port || 443;

    console.log(`Menyambungkan bot ke: ${hostname}:${targetPort}`);

    const serverSocket = net.connect(targetPort, hostname, () => {
        clientSocket.write('HTTP/1.1 200 Connection Established\r\n' +
                           'Proxy-agent: Node.js-Proxy\r\n' +
                           '\r\n');
        serverSocket.write(head);
        serverSocket.pipe(clientSocket);
        clientSocket.pipe(serverSocket);
    });

    serverSocket.on('error', (err) => {
        console.error(`Error ke target ${hostname}:`, err.message);
        clientSocket.end();
    });

    clientSocket.on('error', (err) => {
        console.error('Client error:', err.message);
        serverSocket.end();
    });
});

const PORT = process.env.PORT || 10000;
server.listen(PORT, () => {
    console.log(`Proxy siap beroperasi di port ${PORT}`);
});
