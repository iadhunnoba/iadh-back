const mqtt = require('mqtt');
const serialport = require('serialport');

const port = new serialport('COM4', { // Dependera del puerto al que esta conectado arduino
    baudRate: 9600
}); 

const parser = port.pipe(new serialport.parsers.Readline({delimiter: '\n'}));

// Establesco la conexión
const pub = mqtt.connect('http://localhost:9000');


pub.on('connect', () => {
    // Este metodo 'publish' indica que ya puede comenzar a publicar
    /* Como primer parametro es un string con el que vamos a nombrar el topico. 
       El topico es un nombre al cual van a estar asocieados los datos o mensajes del publisher. 
    */
    /* Como segundo parametro es el mensaje que se quiere enviar, osea los datos.
    */

    /* pub.publish('topic test', 'Hello world!') */

    // El evento 'data' se ejecuta cuando lee o le llegan datos del serial
    parser.on('data', (data) => {
        pub.publish('topic test', data)
    })
    
})