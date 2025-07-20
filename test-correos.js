const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

transporter.sendMail({
  from: process.env.EMAIL_USER,
  to: process.env.EMAIL_TO,
  subject: 'Prueba de envío solo a @walwil',
  text: 'Hola, esto es una prueba para confirmar si el dominio @walwil acepta correos desde Gmail con Nodemailer.',
}, (error, info) => {
  if (error) {
    return console.error('❌ Error al enviar:', error);
  }
  console.log('✅ Correo enviado con éxito:', info.response);
  console.log('correo:', process.env.EMAIL_TO);
});
