const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { UniqueConstraintError } = require('sequelize');
const { Usuario } = require('../models');

const normalizarNombreCompleto = (nombre) => {
    return nombre.replace(/\s+/gu, ' ').trim();
};

const nombreCompletoEsValido = (nombre) => {
    if(!/^[\p{L}\s'-]+$/u.test(nombre)) {
        return false;
    }

    const partes = nombre.split(/\s+/u).filter(Boolean);

    if (partes.length < 2) {
        return false;
    }

    return partes.every((parte) => {
        const letras = parte.match(/\p{L}/gu) || [];
        return letras.length >= 2;
    });
};

const passwordEsSegura = (password) => {
    return password.length >= 8 
        && /[A-Z]/.test(password)
        && /[0-9]/.test(password)
        && /[^A-Za-z0-9]/.test(password);
};

const registrar = async (req, res) => {
    const {
        nombre_completo,
        email,
        password,
        confirm_password
    } = req.body;

    if (
        typeof nombre_completo !== 'string'
        || typeof email !== 'string'
        || typeof password !== 'string'
        || typeof confirm_password !== 'string'
    ) {
        return res.status(400).json({
            success: false,
            mensaje: 'Complete todos los campos obligatorios'
        });
    }

    const nombreNormalizado = normalizarNombreCompleto(nombre_completo);
    const emailNormalizado = email.trim().toLowerCase();

    if (!nombreCompletoEsValido(nombreNormalizado)) {
        return res.status(400).json({
            success: false,
            mensaje: 'Ingresá un nombre y apellido válidos'
        });
    }

    if (nombreNormalizado.length > 100) {
        return res.status(400).json({
            success: false,
            mensaje: 'El nombre no puede superar los 100 caracteres'
        });
    }

    if (
        emailNormalizado === ''
        || password === ''
        || confirm_password === ''
    ){
        return res.status(400).json({
            success: false,
            mensaje: 'Complete todos los campos obligatorios'
        });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailNormalizado)) {
        return res.status(400).json({
            success: false,
            mensaje: 'El email no es válido'
        });
    }

    if (password !== confirm_password) {
        return res.status(400).json({
            success: false,
            mensaje: 'Las contraseñas no coinciden'
        });
    }

    if (!passwordEsSegura(password)) {
        return res.status(400).json({
            success: false,
            mensaje: 'La contraseña no cumple los requisitos de seguridad'
        });
    }

    try {
        const usuarioExistente = await Usuario.findOne({
            where: { email: emailNormalizado }
        });

        if (usuarioExistente) {
            return res.status(400).json({
                success: false,
                mensaje: 'El email ya está registrado'
            });
        }

        const passwordHash = await bcrypt.hash(password, 12);

        await Usuario.create({
            nombre_completo: nombreNormalizado,
            email: emailNormalizado,
            password_hash: passwordHash,
            es_admin: 0,
            activo: 1
        });

        return res.status(201).json({
            success:true,
            mensaje: 'Usuario registrado correctamente'
        });
    } catch (error) {
        if (error instanceof UniqueConstraintError) {
            return res.status(400).json({
                success: false,
                mensaje: 'El email ya está registrado'
            });
        }

        return res.status(500).json({
            success: false,
            mensaje: 'Error al registrar el usuario'
        });
    }
};

const login = async (req, res) => {
    const { email, password } = req.body;

    if (
        typeof email !== 'string'
        || typeof password !== 'string'
        || email.trim() === ''
        || password === ''
    ) {
        return res.status(400).json({
            success: false,
            mensaje: 'Complete todos los campos obligatorios'
        });
    }

    const emailNormalizado = email.trim().toLowerCase();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailNormalizado)) {
        return res.status(400).json({
            success: false,
            mensaje: 'El email no es válido'
        });
    }

    try {
        const usuario = await Usuario.findOne({
            where: { email: emailNormalizado }
        });

        if (!usuario) {
            return res.status(401).json({
                success: false,
                mensaje: 'Email o contraseña incorrectos'
            });
        }

        let hash = usuario.password_hash;

        if (hash.startsWith('$2y$')) {
            hash = '$2b$' + hash.slice(4);
        }

        const passwordCorrecta = await bcrypt.compare(password, hash);

        if (!passwordCorrecta) {
            return res.status(401).json({
                success: false,
                mensaje: 'Email o contraseña incorrectos'
            });
        }

        if (usuario.activo !== 1) {
            return res.status(403).json({
                success: false,
                mensaje: 'El usuario se encuentra inactivo'
            });
        }

        const token = jwt.sign(
            {
                id_usuario: usuario.id_usuario,
                es_admin: usuario.es_admin
            },
            process.env.JWT_SECRET,
            {
                expiresIn: process.env.JWT_EXPIRES_IN
            }
        );

        return res.json({
            success: true,
            mensaje: 'Inicio de sesión correcto',
            token,
            usuario: {
                id_usuario: usuario.id_usuario,
                nombre_completo: usuario.nombre_completo,
                email: usuario.email,
                es_admin: usuario.es_admin,
                avatar: usuario.avatar,
                fecha_registro: usuario.fecha_registro
            }
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            mensaje: 'Error al iniciar sesión'
        });
    }
};

const me = async (req, res) => {
    return res.json({
        success: true,
        usuario: req.user
    });
};

module.exports = {
    registrar,
    login,
    me
};