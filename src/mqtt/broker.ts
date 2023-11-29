const mosca = require('mosca');

const broker = new mosca.Server({
    port: 9000
});


// Este evento 'ready' se lanza cuando el servidor esta OK
broker.on('ready', () => {
    console.log("Mosca broker is ready");
});


// Este evento 'clientConnected' se lanza cuando se conecta un nuevo cliente (publisher o suscriptor)
broker.on('clientConnected', (client) => {
    console.log('New client ' + client.id);
});

// Este evento 'published' se lanza cuando el broker recibe un mensaje de un publisher para ser disponibilizado para algún suscriptor
/* broker.on('published', (packet) => {
    console.log(packet.payload.toString());
});
 */
