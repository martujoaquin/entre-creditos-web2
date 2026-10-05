<?php

class Usuario
{
    private PDO $conexion;

    public function __construct(PDO $conexion)
    {
        $this->conexion = $conexion;
    }

    public function buscarPorEmail(string $email): ?array
    {
        $sql = "SELECT
                    id_usuario,
                    nombre_completo,
                    email,
                    password_hash,
                    es_admin,
                    avatar,
                    activo,
                    fecha_registro
                FROM usuarios
                WHERE email = :email
                LIMIT 1";
        $consulta = $this->conexion->prepare($sql);
        $consulta->bindValue(':email', $email);
        $consulta->execute();

        $usuario = $consulta->fetch();

        return $usuario ?: null;
    }

    public function buscarPublicoPorId(int $idUsuario): ?array
    {
        $sql = "SELECT
                    id_usuario,
                    nombre_completo,
                    email,
                    es_admin,
                    avatar,
                    fecha_registro
                FROM usuarios
                WHERE id_usuario = :id_usuario
                LIMIT 1";
        $consulta = $this->conexion->prepare($sql);
        $consulta->bindValue(':id_usuario', $idUsuario, PDO::PARAM_INT);
        $consulta->execute();

        $usuario = $consulta->fetch();

        return $usuario ?: null;
    }

    public function buscarAdminPorId(int $idUsuario): ?array
    {
        $sql = "SELECT
                    id_usuario,
                    nombre_completo,
                    email,
                    avatar,
                    es_admin,
                    activo
                FROM usuarios
                WHERE id_usuario = :id_usuario
                LIMIT 1";
        $consulta = $this->conexion->prepare($sql);
        $consulta->bindValue(':id_usuario', $idUsuario, PDO::PARAM_INT);
        $consulta->execute();

        $usuario = $consulta->fetch();

        return $usuario ?: null;
    }

    public function obtenerTodosAdmin(): array
    {
        $sql = "SELECT
                    id_usuario,
                    nombre_completo,
                    email,
                    avatar,
                    es_admin,
                    activo
                FROM usuarios
                ORDER BY nombre_completo ASC";
        $consulta = $this->conexion->prepare($sql);
        $consulta->execute();

        return $consulta->fetchAll();
    }

    public function buscarPorEmailExcluyendoId(string $email, int $idUsuario): ?array
    {
        $sql = "SELECT
                    id_usuario,
                    nombre_completo,
                    email,
                    avatar,
                    es_admin,
                    activo
                FROM usuarios
                WHERE email = :email
                AND id_usuario <> :id_usuario
                LIMIT 1";
        $consulta = $this->conexion->prepare($sql);
        $consulta->bindValue(':email', $email);
        $consulta->bindValue(':id_usuario', $idUsuario, PDO::PARAM_INT);
        $consulta->execute();

        $usuario = $consulta->fetch();

        return $usuario ?: null;
    }

    public function buscarCredencialesPorId(int $idUsuario): ?array
    {
        $sql = "SELECT
                    id_usuario,
                    password_hash
                FROM usuarios
                WHERE id_usuario = :id_usuario
                LIMIT 1";
        $consulta = $this->conexion->prepare($sql);
        $consulta->bindValue(':id_usuario', $idUsuario, PDO::PARAM_INT);
        $consulta->execute();

        $usuario = $consulta->fetch();

        return $usuario ?: null;
    }

    public function registrar(string $nombreCompleto, string $email, string $password): bool
    {
        $sql = "INSERT INTO usuarios (
                    nombre_completo,
                    email,
                    password_hash,
                    es_admin,
                    avatar,
                    activo
                ) VALUES (
                    :nombre_completo,
                    :email,
                    :password_hash,
                    0,
                    :avatar,
                    1
                )";

        $consulta = $this->conexion->prepare($sql);

        return $consulta->execute([
            ':nombre_completo' => $nombreCompleto,
            ':email' => $email,
            ':password_hash' => password_hash($password, PASSWORD_DEFAULT),
            ':avatar' => 'uploads/avatars/default-avatar.png'
        ]);
    }

    public function actualizarPerfil(int $idUsuario, string $nombreCompleto, ?string $avatar): bool
    {
        if ($avatar === null) {
            $sql = "UPDATE usuarios
                    SET nombre_completo = :nombre_completo
                    WHERE id_usuario = :id_usuario";
            $consulta = $this->conexion->prepare($sql);
            $consulta->bindValue(':nombre_completo', $nombreCompleto);
            $consulta->bindValue(':id_usuario', $idUsuario, PDO::PARAM_INT);

            return $consulta->execute();
        }

        $sql = "UPDATE usuarios
                SET nombre_completo = :nombre_completo,
                    avatar = :avatar
                WHERE id_usuario = :id_usuario";
        $consulta = $this->conexion->prepare($sql);
        $consulta->bindValue(':nombre_completo', $nombreCompleto);
        $consulta->bindValue(':avatar', $avatar);
        $consulta->bindValue(':id_usuario', $idUsuario, PDO::PARAM_INT);

        return $consulta->execute();
    }

    public function actualizarPassword(int $idUsuario, string $passwordHash): bool
    {
        $sql = "UPDATE usuarios
                SET password_hash = :password_hash
                WHERE id_usuario = :id_usuario";
        $consulta = $this->conexion->prepare($sql);
        $consulta->bindValue(':password_hash', $passwordHash);
        $consulta->bindValue(':id_usuario', $idUsuario, PDO::PARAM_INT);

        return $consulta->execute();
    }

    public function actualizarAdmin(int $idUsuario, array $datos): bool
    {
        $sql = "UPDATE usuarios
                SET nombre_completo = CASE WHEN :actualizar_nombre_completo = 1 THEN :nombre_completo ELSE nombre_completo END,
                    email = CASE WHEN :actualizar_email = 1 THEN :email ELSE email END,
                    avatar = CASE WHEN :actualizar_avatar = 1 THEN :avatar ELSE avatar END,
                    es_admin = CASE WHEN :actualizar_es_admin = 1 THEN :es_admin ELSE es_admin END,
                    activo = CASE WHEN :actualizar_activo = 1 THEN :activo ELSE activo END
                WHERE id_usuario = :id_usuario";
        $consulta = $this->conexion->prepare($sql);

        return $consulta->execute([
            ':actualizar_nombre_completo' => array_key_exists('nombre_completo', $datos) ? 1 : 0,
            ':nombre_completo' => $datos['nombre_completo'] ?? '',
            ':actualizar_email' => array_key_exists('email', $datos) ? 1 : 0,
            ':email' => $datos['email'] ?? '',
            ':actualizar_avatar' => array_key_exists('avatar', $datos) ? 1 : 0,
            ':avatar' => $datos['avatar'] ?? '',
            ':actualizar_es_admin' => array_key_exists('es_admin', $datos) ? 1 : 0,
            ':es_admin' => $datos['es_admin'] ?? 0,
            ':actualizar_activo' => array_key_exists('activo', $datos) ? 1 : 0,
            ':activo' => $datos['activo'] ?? 0,
            ':id_usuario' => $idUsuario
        ]);
    }

    public function obtenerEstadisticasPerfil(int $idUsuario): array
    {
        $sqlResumen = "SELECT
                            COUNT(r.id_resena) AS cantidad_resenas,
                            AVG(r.puntuacion) AS promedio_puntuacion
                        FROM resenas r
                        INNER JOIN peliculas p ON p.id_pelicula = r.id_pelicula
                        WHERE r.id_usuario = :id_usuario
                        AND p.activo = 1";
        $consultaResumen = $this->conexion->prepare($sqlResumen);
        $consultaResumen->bindValue(':id_usuario', $idUsuario, PDO::PARAM_INT);
        $consultaResumen->execute();
        $resumen = $consultaResumen->fetch() ?: [];

        $sqlGenero = "SELECT g.nombre
                      FROM resenas r
                      INNER JOIN peliculas p ON p.id_pelicula = r.id_pelicula
                      INNER JOIN generos g ON g.id_genero = p.id_genero
                      WHERE r.id_usuario = :id_usuario
                      AND p.activo = 1
                      GROUP BY g.id_genero, g.nombre
                      ORDER BY COUNT(r.id_resena) DESC, g.nombre ASC
                      LIMIT 1";
        $consultaGenero = $this->conexion->prepare($sqlGenero);
        $consultaGenero->bindValue(':id_usuario', $idUsuario, PDO::PARAM_INT);
        $consultaGenero->execute();

        $sqlCompartidas = "SELECT COUNT(id_compartida)
                           FROM resenas_compartidas
                           WHERE id_usuario_remitente = :id_usuario";
        $consultaCompartidas = $this->conexion->prepare($sqlCompartidas);
        $consultaCompartidas->bindValue(':id_usuario', $idUsuario, PDO::PARAM_INT);
        $consultaCompartidas->execute();

        $cantidad = (int) ($resumen['cantidad_resenas'] ?? 0);
        $promedio = $resumen['promedio_puntuacion'] !== null
            ? round((float) $resumen['promedio_puntuacion'], 1)
            : null;

        return [
            'cantidad_resenas' => $cantidad,
            'promedio_puntuacion' => $promedio,
            'genero_mas_resenado' => $consultaGenero->fetchColumn() ?: null,
            'cantidad_compartidas' => (int) $consultaCompartidas->fetchColumn()
        ];
    }
}
