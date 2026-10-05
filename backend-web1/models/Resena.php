<?php

class Resena
{
    private PDO $conexion;

    public function __construct(PDO $conexion)
    {
        $this->conexion = $conexion;
    }

    public function getByMovie(int $movieId): array
    {
        $sql = "SELECT
                    r.id_resena,
                    r.id_usuario,
                    r.id_pelicula,
                    r.frase_destacada,
                    r.contenido,
                    r.puntuacion,
                    r.fecha_creacion,
                    r.fecha_modificacion,
                    u.nombre_completo,
                    u.avatar
                FROM resenas r
                INNER JOIN usuarios u ON u.id_usuario = r.id_usuario
                WHERE r.id_pelicula = :id_pelicula
                ORDER BY r.fecha_creacion DESC";

        $consulta = $this->conexion->prepare($sql);
        $consulta->bindValue(':id_pelicula', $movieId, PDO::PARAM_INT);
        $consulta->execute();

        return array_map([$this, 'formatearResena'], $consulta->fetchAll());
    }

    public function obtenerTodasAdmin(): array
    {
        $sql = "SELECT
                    r.id_resena,
                    r.frase_destacada,
                    r.contenido,
                    r.puntuacion,
                    r.fecha_creacion,
                    u.id_usuario,
                    u.nombre_completo,
                    u.avatar,
                    p.id_pelicula,
                    p.titulo,
                    p.imagen,
                    p.activo
                FROM resenas r
                INNER JOIN usuarios u ON u.id_usuario = r.id_usuario
                INNER JOIN peliculas p ON p.id_pelicula = r.id_pelicula
                ORDER BY r.fecha_creacion DESC, r.id_resena DESC";

        $consulta = $this->conexion->prepare($sql);
        $consulta->execute();

        return array_map([$this, 'formatearResenaAdmin'], $consulta->fetchAll());
    }

    public function obtenerUltimasLanding(int $limite = 3): array
    {
        $sql = "SELECT
                    r.id_resena,
                    r.frase_destacada,
                    r.contenido,
                    r.puntuacion,
                    r.fecha_creacion,
                    u.id_usuario,
                    u.nombre_completo,
                    u.avatar,
                    p.id_pelicula,
                    p.titulo,
                    p.director,
                    p.anio,
                    p.imagen
                FROM resenas r
                INNER JOIN usuarios u ON u.id_usuario = r.id_usuario
                INNER JOIN peliculas p ON p.id_pelicula = r.id_pelicula
                WHERE p.activo = 1
                AND u.activo = 1
                ORDER BY r.fecha_creacion DESC, r.id_resena DESC
                LIMIT :limite";

        $consulta = $this->conexion->prepare($sql);
        $consulta->bindValue(':limite', $limite, PDO::PARAM_INT);
        $consulta->execute();

        return array_map([$this, 'formatearResenaLanding'], $consulta->fetchAll());
    }

    public function create(int $userId, int $movieId, array $data): array
    {
        $sql = "INSERT INTO resenas (
                    id_usuario,
                    id_pelicula,
                    frase_destacada,
                    contenido,
                    puntuacion
                ) VALUES (
                    :id_usuario,
                    :id_pelicula,
                    :frase_destacada,
                    :contenido,
                    :puntuacion
                )";

        $consulta = $this->conexion->prepare($sql);
        $consulta->bindValue(':id_usuario', $userId, PDO::PARAM_INT);
        $consulta->bindValue(':id_pelicula', $movieId, PDO::PARAM_INT);
        $consulta->bindValue(':frase_destacada', $data['frase_destacada']);
        $consulta->bindValue(':contenido', $data['contenido']);
        $consulta->bindValue(':puntuacion', $data['puntuacion'], PDO::PARAM_INT);
        $consulta->execute();

        return $this->findById((int) $this->conexion->lastInsertId()) ?? [];
    }

    public function update(int $reviewId, int $userId, bool $isAdmin, array $data): array
    {
        $resena = $this->findById($reviewId);

        if ($resena === null || (!$isAdmin && (int) $resena['id_usuario'] !== $userId)) {
            return [];
        }

        $sql = "UPDATE resenas
                SET frase_destacada = :frase_destacada,
                    contenido = :contenido,
                    puntuacion = :puntuacion
                WHERE id_resena = :id_resena";

        $consulta = $this->conexion->prepare($sql);
        $consulta->bindValue(':frase_destacada', $data['frase_destacada']);
        $consulta->bindValue(':contenido', $data['contenido']);
        $consulta->bindValue(':puntuacion', $data['puntuacion'], PDO::PARAM_INT);
        $consulta->bindValue(':id_resena', $reviewId, PDO::PARAM_INT);
        $consulta->execute();

        return $this->findById($reviewId) ?? [];
    }

    public function delete(int $reviewId, int $userId, bool $isAdmin): bool
    {
        $resena = $this->findById($reviewId);

        if ($resena === null || (!$isAdmin && (int) $resena['id_usuario'] !== $userId)) {
            return false;
        }

        $sql = "DELETE FROM resenas WHERE id_resena = :id_resena";
        $consulta = $this->conexion->prepare($sql);
        $consulta->bindValue(':id_resena', $reviewId, PDO::PARAM_INT);

        return $consulta->execute();
    }

    public function findById(int $reviewId): ?array
    {
        $sql = "SELECT
                    r.id_resena,
                    r.id_usuario,
                    r.id_pelicula,
                    r.frase_destacada,
                    r.contenido,
                    r.puntuacion,
                    r.fecha_creacion,
                    r.fecha_modificacion,
                    u.nombre_completo,
                    u.avatar
                FROM resenas r
                INNER JOIN usuarios u ON u.id_usuario = r.id_usuario
                WHERE r.id_resena = :id_resena
                LIMIT 1";

        $consulta = $this->conexion->prepare($sql);
        $consulta->bindValue(':id_resena', $reviewId, PDO::PARAM_INT);
        $consulta->execute();

        $resena = $consulta->fetch();

        return $resena ? $this->formatearResena($resena) : null;
    }

    public function existsForUserAndMovie(int $userId, int $movieId): bool
    {
        $sql = "SELECT 1
                FROM resenas
                WHERE id_usuario = :id_usuario
                AND id_pelicula = :id_pelicula
                LIMIT 1";

        $consulta = $this->conexion->prepare($sql);
        $consulta->bindValue(':id_usuario', $userId, PDO::PARAM_INT);
        $consulta->bindValue(':id_pelicula', $movieId, PDO::PARAM_INT);
        $consulta->execute();

        return (bool) $consulta->fetchColumn();
    }

    private function formatearResena(array $resena): array
    {
        return [
            'id_resena' => (int) $resena['id_resena'],
            'id_usuario' => (int) $resena['id_usuario'],
            'id_pelicula' => (int) $resena['id_pelicula'],
            'frase_destacada' => $resena['frase_destacada'],
            'contenido' => $resena['contenido'],
            'puntuacion' => (int) $resena['puntuacion'],
            'fecha_creacion' => $resena['fecha_creacion'],
            'fecha_modificacion' => $resena['fecha_modificacion'],
            'autor' => [
                'id_usuario' => (int) $resena['id_usuario'],
                'nombre_completo' => $resena['nombre_completo'],
                'avatar' => $resena['avatar']
            ]
        ];
    }

    private function formatearResenaAdmin(array $resena): array
    {
        return [
            'id_resena' => (int) $resena['id_resena'],
            'frase_destacada' => $resena['frase_destacada'],
            'contenido' => $resena['contenido'],
            'puntuacion' => (int) $resena['puntuacion'],
            'fecha_creacion' => $resena['fecha_creacion'],
            'autor' => [
                'id_usuario' => (int) $resena['id_usuario'],
                'nombre_completo' => $resena['nombre_completo'],
                'avatar' => $resena['avatar']
            ],
            'pelicula' => [
                'id_pelicula' => (int) $resena['id_pelicula'],
                'titulo' => $resena['titulo'],
                'imagen' => $resena['imagen'],
                'activo' => (int) $resena['activo']
            ]
        ];
    }

    private function formatearResenaLanding(array $resena): array
    {
        return [
            'id_resena' => (int) $resena['id_resena'],
            'frase_destacada' => $resena['frase_destacada'],
            'contenido' => $resena['contenido'],
            'puntuacion' => (int) $resena['puntuacion'],
            'fecha_creacion' => $resena['fecha_creacion'],
            'autor' => [
                'id_usuario' => (int) $resena['id_usuario'],
                'nombre_completo' => $resena['nombre_completo'],
                'avatar' => $resena['avatar']
            ],
            'pelicula' => [
                'id_pelicula' => (int) $resena['id_pelicula'],
                'titulo' => $resena['titulo'],
                'director' => $resena['director'],
                'anio' => (int) $resena['anio'],
                'imagen' => $resena['imagen']
            ]
        ];
    }
}
