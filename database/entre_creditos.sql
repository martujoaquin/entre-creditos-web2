-- =========================================================
-- ENTRE CRÉDITOS
-- Base de datos inicial
-- Compatible con MySQL / MariaDB (XAMPP)
-- =========================================================

CREATE DATABASE IF NOT EXISTS entre_creditos
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE entre_creditos;

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS resenas_compartidas;
DROP TABLE IF EXISTS resenas;
DROP TABLE IF EXISTS peliculas;
DROP TABLE IF EXISTS generos;
DROP TABLE IF EXISTS usuarios;

SET FOREIGN_KEY_CHECKS = 1;

-- =========================================================
-- TABLA: usuarios
-- =========================================================

CREATE TABLE usuarios (
    id_usuario INT UNSIGNED AUTO_INCREMENT,
    nombre_completo VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    es_admin TINYINT(1) NOT NULL DEFAULT 0,
    avatar VARCHAR(255) NOT NULL DEFAULT 'uploads/avatars/default-avatar.png',
    activo TINYINT(1) NOT NULL DEFAULT 1,
    fecha_registro DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT pk_usuarios
        PRIMARY KEY (id_usuario),

    CONSTRAINT uq_usuarios_email
        UNIQUE (email),

    CONSTRAINT chk_usuarios_es_admin
        CHECK (es_admin IN (0, 1)),

    CONSTRAINT chk_usuarios_activo
        CHECK (activo IN (0, 1))
) ENGINE=InnoDB;

-- =========================================================
-- TABLA: generos
-- =========================================================

CREATE TABLE generos (
    id_genero INT UNSIGNED AUTO_INCREMENT,
    nombre VARCHAR(80) NOT NULL,

    CONSTRAINT pk_generos
        PRIMARY KEY (id_genero),

    CONSTRAINT uq_generos_nombre
        UNIQUE (nombre)
) ENGINE=InnoDB;

-- =========================================================
-- TABLA: peliculas
-- =========================================================

CREATE TABLE peliculas (
    id_pelicula INT UNSIGNED AUTO_INCREMENT,
    titulo VARCHAR(150) NOT NULL,
    director VARCHAR(120) NOT NULL,
    anio YEAR NOT NULL,
    sinopsis TEXT NOT NULL,
    imagen VARCHAR(255) NOT NULL,
    id_genero INT UNSIGNED NOT NULL,
    activo TINYINT(1) NOT NULL DEFAULT 1,

    CONSTRAINT pk_peliculas
        PRIMARY KEY (id_pelicula),

    CONSTRAINT uq_peliculas_titulo_anio
        UNIQUE (titulo, anio),

    CONSTRAINT chk_peliculas_activo
        CHECK (activo IN (0, 1)),

    CONSTRAINT fk_peliculas_genero
        FOREIGN KEY (id_genero)
        REFERENCES generos (id_genero)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
) ENGINE=InnoDB;

-- =========================================================
-- TABLA: resenas
-- =========================================================

CREATE TABLE resenas (
    id_resena INT UNSIGNED AUTO_INCREMENT,
    id_usuario INT UNSIGNED NOT NULL,
    id_pelicula INT UNSIGNED NOT NULL,
    frase_destacada VARCHAR(220) NULL,
    contenido TEXT NOT NULL,
    puntuacion TINYINT UNSIGNED NOT NULL,
    fecha_creacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_modificacion DATETIME NULL DEFAULT NULL
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT pk_resenas
        PRIMARY KEY (id_resena),

    CONSTRAINT uq_resenas_usuario_pelicula
        UNIQUE (id_usuario, id_pelicula),

    CONSTRAINT chk_resenas_puntuacion
        CHECK (puntuacion BETWEEN 1 AND 5),

    CONSTRAINT fk_resenas_usuario
        FOREIGN KEY (id_usuario)
        REFERENCES usuarios (id_usuario)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT fk_resenas_pelicula
        FOREIGN KEY (id_pelicula)
        REFERENCES peliculas (id_pelicula)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
) ENGINE=InnoDB;

-- =========================================================
-- TABLA: resenas_compartidas
-- Compartir significa recomendar una reseña: "leé esto".
-- No incluye mensajes ni chat.
-- =========================================================

CREATE TABLE resenas_compartidas (
    id_compartida INT UNSIGNED AUTO_INCREMENT,
    id_resena INT UNSIGNED NOT NULL,
    id_usuario_remitente INT UNSIGNED NOT NULL,
    id_usuario_destino INT UNSIGNED NOT NULL,
    fecha_compartida DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT pk_resenas_compartidas
        PRIMARY KEY (id_compartida),

    CONSTRAINT uq_resenas_compartidas
        UNIQUE (
            id_resena,
            id_usuario_remitente,
            id_usuario_destino
        ),

    CONSTRAINT chk_compartidas_usuarios_distintos
        CHECK (id_usuario_remitente <> id_usuario_destino),

    CONSTRAINT fk_compartidas_resena
        FOREIGN KEY (id_resena)
        REFERENCES resenas (id_resena)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CONSTRAINT fk_compartidas_remitente
        FOREIGN KEY (id_usuario_remitente)
        REFERENCES usuarios (id_usuario)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT fk_compartidas_destino
        FOREIGN KEY (id_usuario_destino)
        REFERENCES usuarios (id_usuario)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    INDEX idx_compartidas_destino (id_usuario_destino)
) ENGINE=InnoDB;

-- =========================================================
-- DATOS INICIALES
-- =========================================================

INSERT INTO generos (nombre) VALUES
    ('Acción'),
    ('Animación'),
    ('Ciencia ficción'),
    ('Comedia'),
    ('Crimen'),
    ('Drama'),
    ('Fantasía'),
    ('Terror'),
    ('Thriller');

-- Usuario administrador inicial
-- Email: admin@entrecreditos.com
-- Contraseña temporal: Admin123!
-- IMPORTANTE: cambiarla después de probar el sistema.

INSERT INTO usuarios (
    nombre_completo,
    email,
    password_hash,
    es_admin,
    activo
) VALUES (
    'Administrador Entre Créditos',
    'admin@entrecreditos.com',
    '$2y$12$JPat0S/gAwbPVrU53JYoS.N7NG1cvkKym0/N7Ez7nYvGB/G6mKULi',
    1,
    1
);

-- =========================================================
-- REGLAS QUE DEBE APLICAR EL BACKEND
-- =========================================================
--
-- 1. Las películas inactivas no se muestran en el catálogo.
-- 2. No se pueden crear nuevas reseñas para películas inactivas.
-- 3. Las reseñas de películas inactivas no son visibles.
-- 4. Al reactivar una película, vuelven a mostrarse sus reseñas.
-- 5. Los usuarios inactivos no pueden iniciar sesión.
-- 6. El autor puede editar y eliminar su reseña.
-- 7. El administrador puede eliminar cualquier reseña.
-- 8. Cualquier miembro puede compartir cualquier reseña visible.
-- =========================================================
