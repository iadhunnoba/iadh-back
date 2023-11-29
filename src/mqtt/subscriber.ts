// Establesco la conexión
const sub = mqtt.connect('http://localhost:9000');

sub.on('connect', () => {
    // Me suscribo mediante el topico
    sub.subscribe('topic test');
})


// Este evento 'message' se utiliza para recibir los mensajes
sub.on('message', (topic, message) => {
    console.log(message.toString());
})