require('dotenv').config();
const express = require('express');
const multer = require('multer');
const nodemailer = require('nodemailer');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Multer config (archivos temporales en /uploads)
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

// Ruta para oficina (1 archivo)
app.post('/upload/oficina', upload.single('pdf'), async (req, res) => {
  try {
    const { nombreVisita, empresaVisita } = req.body;
    const archivo = req.file;

    if (!archivo) return res.status(400).send('No se recibió el archivo.');

    await enviarCorreo({
      asunto: 'Solicitud de Visita a Oficina',
      nombre: nombreVisita,
      empresa: empresaVisita,
      archivos: [archivo]
    });

    res.status(200).send('Correo enviado desde oficina.');
    console.log('Correo enviado desde oficina con archivo:', archivo.originalname);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al enviar correo.');
  }
});

// Ruta para patio (3 archivos)
app.post('/upload/patio', upload.array('pdfs', 3), async (req, res) => {
  try {
    const { nombreVisita, nombreEmpresa } = req.body; // fijarse nombres del formulario
    const archivos = req.files;

    if (!archivos || archivos.length !== 3) {
      return res.status(400).send('Debes subir exactamente 3 archivos.');
    }

    await enviarCorreo({
      asunto: 'Solicitud de Trabajo en Patio',
      nombre: nombreVisita,
      empresa: nombreEmpresa,
      archivos: archivos
    });

    res.status(200).send('Correo enviado desde patio.');
    console.log('Correo enviado desde patio con archivos:', archivos.map(f => f.originalname));
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al enviar correo.');
  }
});

// Función para enviar correo con archivos adjuntos
async function enviarCorreo({ asunto, nombre, empresa, archivos }) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER, // Ejemplo: vdcqrorecepcionfinanzas@gmail.com
      pass: process.env.EMAIL_PASS, // Contraseña o app password
    },
  });

  const attachments = archivos.map(file => ({
    filename: file.originalname,
    path: path.join(__dirname, file.path)
  }));

  await transporter.sendMail({
    from: `"Sistema de Solicitudes" <${process.env.EMAIL_USER}>`,
    to: process.env.EMAIL_TO, // En .env define: EMAIL_TO=correo1@ejemplo.com,correo2@ejemplo.com
    subject: asunto,
    text: `Nombre: ${nombre}\nEmpresa: ${empresa}`,
    attachments
  });

  // Eliminar archivos temporales
  archivos.forEach(file => fs.unlink(file.path, (err) => {
    if (err) console.error('Error eliminando archivo:', err);
  }));
}

app.listen(PORT, () => {
  console.log(`Servidor iniciado en http://localhost:${PORT}`);
});
