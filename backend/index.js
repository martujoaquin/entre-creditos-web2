require('dotenv').config();

const express = require('express');
const sequelize = require('./config/database');
const generoRoutes = require('./routes/generoRoutes');
const peliculaRoutes = require('./routes/peliculaRoutes');
const resetRoutes = require('./routes/resetRoutes');
const usuarioRoutes = require('./routes/usuarioRoutes');
const resenaRoutes = require('./routes/resenaRoutes');
const resenaCompartidaRoutes = require('./routes/resenaCompartidaRoutes');
const authRoutes = require('./routes/authRoutes');

const app = express();
app.use(express.json());
app.use('/api/generos', generoRoutes);
app.use('/api/peliculas', peliculaRoutes);
app.use('/api/reset', resetRoutes);
app.use('/api/usuarios', usuarioRoutes);
app.use('/api', resenaCompartidaRoutes);
app.use('/api/resenas', resenaRoutes);
app.use('/api/peliculas/:id/resenas', resenaRoutes);
app.use('/api/auth', authRoutes);

const PORT = 3000;

app.get('/', (req, res) => {
    res.send('API Entre Créditos funcionando');
});

async function iniciarServidor() {
    try {
        await sequelize.authenticate();
        console.log('Conexión a MySQL exitosa');

        app.listen(PORT, () => {
            console.log(`Servidor corriendo en http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('Error al conectar con MySQL:', error);
    }
}

iniciarServidor();
