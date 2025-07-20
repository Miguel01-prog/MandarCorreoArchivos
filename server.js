require('dotenv').config();
const express = require('express');
const multer = require('multer');
const nodemailer = require('nodemailer');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

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
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al enviar correo.');
  }
});

// Ruta para patio (3 archivos)
app.post('/upload/patio', upload.array('pdfs', 3), async (req, res) => {
  try {
    const { nombreVisita, empresaVisita } = req.body;
    const archivos = req.files;

    if (!archivos || archivos.length !== 3) {
      return res.status(400).send('Debes subir exactamente 3 archivos.');
    }

    await enviarCorreo({
      asunto: 'Solicitud de Trabajo en Patio',
      nombre: nombreVisita,
      empresa: empresaVisita,
      archivos: archivos
    });

    res.status(200).send('Correo enviado desde patio.');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al enviar correo.');
  }
});

// Función para enviar correo con archivos adjuntos
async function enviarCorreo({ asunto, nombre, empresa, archivos }) {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });

  const attachments = archivos.map(file => ({
    filename: file.originalname,
    path: path.join(__dirname, file.path)
  }));

  await transporter.sendMail({
    from: `"Sistema de Solicitudes" <${process.env.SMTP_USER}>`,
    to: ['correo1@ejemplo.com', 'correo2@ejemplo.com'], // cámbialos
    subject: asunto,
    text: `Nombre: ${nombre}\nEmpresa: ${empresa}`,
    attachments
  });

  // Eliminar archivos temporales
  archivos.forEach(file => fs.unlink(file.path, () => {}));
}

app.listen(PORT, () => {
  console.log(`Servidor iniciado en http://localhost:${PORT}`);
});
