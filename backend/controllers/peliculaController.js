const { Op, UniqueConstraintError, ForeignKeyConstraintError } = require('sequelize');
const { Pelicula, Genero } = require('../models');
const crypto = require('crypto');
const fs = require('fs/promises');
const path = require('path');

const incluirGenero = {
    model: Genero,
    as: 'genero'
};

const idValido = (id) => Number.isInteger(id) && id > 0;

const anioValido = (anio) => {
    const actual = new Date().getFullYear();
    return Number.isInteger(anio) && anio >= 1888 && anio <= actual;
};

const estadoValido = (activo) => activo === 0 || activo === 1;

const directorioImagenes = path.resolve(__dirname, '../uploads/peliculas');
const rutaDefault = 'uploads/peliculas/default-poster.png';

const firmaImagenValida = (file) => {
    const bytes = file.buffer;
    if (file.mimetype === 'image/jpeg') return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
    if (file.mimetype === 'image/png') return bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
    if (file.mimetype === 'image/webp') return bytes.toString('ascii', 0, 4) === 'RIFF' && bytes.toString('ascii', 8, 12) === 'WEBP';
    return false;
};

const guardarImagen = async (file) => {
    if (!firmaImagenValida(file)) {
        const error = new Error('El contenido de la imagen no es válido');
        error.codigo = 'IMAGEN_INVALIDA';
        throw error;
    }

    const extension = file.mimetype === 'image/jpeg' ? 'jpg' : file.mimetype.slice(6);
    const nombre = `pelicula_${crypto.randomBytes(8).toString('hex')}.${extension}`;
    await fs.mkdir(directorioImagenes, { recursive: true });
    await fs.writeFile(path.join(directorioImagenes, nombre), file.buffer, { flag: 'wx' });
    return { ruta: `uploads/peliculas/${nombre}`, rutaAbsoluta: path.join(directorioImagenes, nombre) };
};

const eliminarImagenAnterior = async (rutaRelativa) => {
    if (!rutaRelativa || rutaRelativa === rutaDefault || !/^uploads\/peliculas\/pelicula_[a-f0-9]{16}\.(jpg|png|webp)$/.test(rutaRelativa)) return;
    await fs.unlink(path.join(directorioImagenes, path.basename(rutaRelativa))).catch(() => {});
};

const normalizarEntero = (valor) => {
    if (typeof valor === 'number' && Number.isInteger(valor)) return valor;
    if (typeof valor === 'string' && /^\d+$/.test(valor.trim())) return Number(valor.trim());
    return null;
};

const validarGenero = async (id_genero) => {
    if (!idValido(id_genero)) return false;
    return Boolean(await Genero.findByPk(id_genero));
};

const obtenerPeliculas = async (req, res) => {
    try {
        const incluirInactivas = req.query.incluir_inactivas === 'true';
        const peliculas = await Pelicula.findAll({
            where: incluirInactivas ? undefined : { activo: 1 },
            include: [incluirGenero],
            order: [['titulo', 'ASC']]
        });

        return res.json(peliculas);
    } catch {
        return res.status(500).json({ mensaje: 'Error al obtener las películas' });
    }
};

const crearPelicula = async (req, res) => {
    const body = req.body || {};
    const titulo = typeof body.titulo === 'string' ? body.titulo.trim() : '';
    const director = typeof body.director === 'string' ? body.director.trim() : '';
    const sinopsis = typeof body.sinopsis === 'string' ? body.sinopsis.trim() : '';
    const anio = normalizarEntero(body.anio);
    const id_genero = normalizarEntero(body.id_genero);
    const activo = body.activo === undefined ? 1 : normalizarEntero(body.activo);
    let imagen = rutaDefault;
    let imagenNueva;

    if (!req.file && typeof body.imagen === 'string' && body.imagen.trim() !== '') {
        imagen = body.imagen.trim();
    }

    if (!titulo) return res.status(400).json({ mensaje: 'El título es obligatorio' });
    if (!director) return res.status(400).json({ mensaje: 'El director es obligatorio' });
    if (!anioValido(anio)) return res.status(400).json({ mensaje: 'El año ingresado no es válido' });
    if (!(await validarGenero(id_genero))) return res.status(400).json({ mensaje: 'El género seleccionado no existe' });
    if (!estadoValido(activo)) return res.status(400).json({ mensaje: 'El estado debe ser 0 o 1' });

    try {
        const duplicada = await Pelicula.findOne({ where: { titulo, anio } });
        if (duplicada) {
            return res.status(409).json({ mensaje: 'La película ya se encuentra registrada' });
        }

        if (req.file) {
            try {
                imagenNueva = await guardarImagen(req.file);
                imagen = imagenNueva.ruta;
            } catch (error) {
                return res.status(400).json({ mensaje: error.codigo === 'IMAGEN_INVALIDA' ? 'El formato de imagen no es válido' : 'No se pudo guardar la imagen' });
            }
        }

        const pelicula = await Pelicula.create({ titulo, director, anio, sinopsis, imagen, id_genero, activo });
        await pelicula.reload({ include: [incluirGenero] });
        return res.status(201).json(pelicula);
    } catch (error) {
        if (imagenNueva) await fs.unlink(imagenNueva.rutaAbsoluta).catch(() => {});
        if (error instanceof UniqueConstraintError) return res.status(409).json({ mensaje: 'La película ya se encuentra registrada' });
        if (error instanceof ForeignKeyConstraintError) return res.status(400).json({ mensaje: 'El género seleccionado no existe' });
        return res.status(500).json({ mensaje: 'Error al crear la película' });
    }
};

const actualizarPelicula = async (req, res) => {
    const id = normalizarEntero(req.params.id);
    if (!idValido(id)) return res.status(404).json({ mensaje: 'La película no existe' });
    let imagenNueva;

    try {
        const pelicula = await Pelicula.findByPk(id);
        if (!pelicula) return res.status(404).json({ mensaje: 'La película no existe' });

        const body = req.body || {};
        const permitidos = ['titulo', 'director', 'anio', 'sinopsis', 'imagen', 'id_genero', 'activo'];
        const cambios = {};
        for (const campo of permitidos) {
            if (Object.prototype.hasOwnProperty.call(body, campo)) cambios[campo] = body[campo];
        }
        if (Object.keys(cambios).length === 0 && !req.file) {
            return res.status(400).json({ mensaje: 'No se recibieron datos para actualizar' });
        }

        for (const campo of ['titulo', 'director', 'sinopsis', 'imagen']) {
            if (campo in cambios) {
                if (typeof cambios[campo] !== 'string' || (campo !== 'sinopsis' && campo !== 'imagen' && cambios[campo].trim() === '')) return res.status(400).json({ mensaje: `El campo ${campo} es obligatorio` });
                cambios[campo] = cambios[campo].trim();
            }
        }
        if ('anio' in cambios) {
            cambios.anio = normalizarEntero(cambios.anio);
            if (!anioValido(cambios.anio)) return res.status(400).json({ mensaje: 'El año ingresado no es válido' });
        }
        if ('id_genero' in cambios) {
            cambios.id_genero = normalizarEntero(cambios.id_genero);
            if (!(await validarGenero(cambios.id_genero))) return res.status(400).json({ mensaje: 'El género seleccionado no existe' });
        }
        if ('activo' in cambios) {
            cambios.activo = normalizarEntero(cambios.activo);
            if (!estadoValido(cambios.activo)) return res.status(400).json({ mensaje: 'El estado debe ser 0 o 1' });
            if (cambios.activo === pelicula.activo) return res.status(400).json({ mensaje: cambios.activo === 1 ? 'La película ya se encuentra activa' : 'La película ya se encuentra inactiva' });
        }

        const titulo = cambios.titulo ?? pelicula.titulo;
        const anio = cambios.anio ?? pelicula.anio;
        if (Object.prototype.hasOwnProperty.call(cambios, 'titulo') || Object.prototype.hasOwnProperty.call(cambios, 'anio')) {
            const duplicada = await Pelicula.findOne({ where: { titulo, anio, id_pelicula: { [Op.ne]: id } } });
            if (duplicada) return res.status(409).json({ mensaje: 'Ya existe otra película con ese título y año' });
        }

        const imagenAnterior = pelicula.imagen;
        if (req.file) {
            try {
                imagenNueva = await guardarImagen(req.file);
                cambios.imagen = imagenNueva.ruta;
            } catch (error) {
                return res.status(400).json({ mensaje: error.codigo === 'IMAGEN_INVALIDA' ? 'El formato de imagen no es válido' : 'No se pudo guardar la imagen' });
            }
        }

        await pelicula.update(cambios);
        if (imagenNueva) await eliminarImagenAnterior(imagenAnterior);
        await pelicula.reload({ include: [incluirGenero] });
        return res.json(pelicula);
    } catch (error) {
        if (typeof imagenNueva !== 'undefined' && imagenNueva) await fs.unlink(imagenNueva.rutaAbsoluta).catch(() => {});
        if (error instanceof UniqueConstraintError) return res.status(409).json({ mensaje: 'Ya existe otra película con ese título y año' });
        if (error instanceof ForeignKeyConstraintError) return res.status(400).json({ mensaje: 'El género seleccionado no existe' });
        return res.status(500).json({ mensaje: 'Error al actualizar la película' });
    }
};

module.exports = { obtenerPeliculas, crearPelicula, actualizarPelicula };
