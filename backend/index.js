const express = require('express');
const sequelize = require('./config/database');
const generoRoutes = require('./routes/generoRoutes');

const app = express();
app.use(express.json());
app.use('/api/generos', generoRoutes);

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