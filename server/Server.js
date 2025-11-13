const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Cargar variables de entorno del archivo .env
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware Global
app.use(cors()); // Habilita CORS
app.use(express.json()); // Permite leer el cuerpo de las solicitudes JSON

// Importar el mapa de Rutas
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const adminRoutes = require('./routes/adminRoutes');

// Usar las Rutas
app.use('/api/auth', authRoutes); 
app.use('/api/products', productRoutes); 
app.use('/api/admin', adminRoutes);

// Ruta de Prueba
app.get('/', (req, res) => {
    res.send('API de AR Market Store está funcionando.');
});

// Iniciar Servidor
app.listen(PORT, () => {
    console.log(`✅ Servidor Express corriendo en http://localhost:${PORT}`);
});