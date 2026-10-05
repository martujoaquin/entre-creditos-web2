<?php

class ResenaCompartida
{
    private PDO $conexion;

    public function __construct(PDO $conexion)
    {
        $this->conexion = $conexion;
    }

    public function getAvailableUsers(int $currentUserId): array
    {
        $sql = "SELECT id_usuario, nombre_completo, avatar
                FROM usuarios
                WHERE id_usuario <> :id_usuario
                AND activo = 1
                ORDER BY nombre_completo ASC";

        $consulta = $this->conexion->prepare($sql);
        $consulta->bindValue(':id_usuario', $currentUserId, PDO::PARAM_INT);
        $consulta->execute();

        return array_map([$this, 'formatearUsuario'], $consulta->fetchAll());
    }

    public function share(int $reviewId, int $senderId, array $recipientIds): array
    {
        $compartidos = [];
        $yaCompartidos = [];

        $this->conexion->beginTransaction();

        try {
            foreach ($recipientIds as $recipientId) {
                if ($this->alreadyShared($reviewId, $senderId, $recipientId)) {
                    $yaCompartidos[] = $recipientId;
                    continue;
                }

                $sql = "INSERT INTO resenas_compartidas (
                            id_resena,
                            id_usuario_remitente,
                            id_usuario_destino
                        ) VALUES (
                            :id_resena,
                            :id_usuario_remitente,
                            :id_usuario_destino
                        )";

                $consulta = $this->conexion->prepare($sql);
                $consulta->bindValue(':id_resena', $reviewId, PDO::PARAM_INT);
                $consulta->bindValue(':id_usuario_remitente', $senderId, PDO::PARAM_INT);
                $consulta->bindValue(':id_usuario_destino', $recipientId, PDO::PARAM_INT);
                $consulta->execute();

                $compartidos[] = $recipientId;
            }

            $this->conexion->commit();
        } catch (Throwable $e) {
            if ($this->conexion->inTransaction()) {
                $this->conexion->rollBack();
            }

            throw $e;
        }

        return [
            'compartidos' => $compartidos,
            'ya_compartidos' => $yaCompartidos
        ];
    }

    public function getSharedWithUser(int $userId): array
    {
        $sql = "SELECT
                    rc.id_compartida,
                    rc.fecha_compartida,
                    remitente.id_usuario AS remitente_id_usuario,
                    remitente.nombre_completo AS remitente_nombre_completo,
                    remitente.avatar AS remitente_avatar,
                    r.id_resena,
                    r.frase_destacada,
                    r.contenido,
                    r.puntuacion,
                    r.fecha_creacion,
                    r.fecha_modificacion,
                    autor.id_usuario AS autor_id_usuario,
                    autor.nombre_completo AS autor_nombre_completo,
                    autor.avatar AS autor_avatar,
                    p.id_pelicula,
                    p.titulo,
                    p.director,
                    p.anio,
                    p.imagen
                FROM resenas_compartidas rc
                INNER JOIN resenas r ON r.id_resena = rc.id_resena
                INNER JOIN usuarios remitente ON remitente.id_usuario = rc.id_usuario_remitente
                INNER JOIN usuarios autor ON autor.id_usuario = r.id_usuario
                INNER JOIN peliculas p ON p.id_pelicula = r.id_pelicula
                WHERE rc.id_usuario_destino = :id_usuario_destino
                AND p.activo = 1
                ORDER BY rc.fecha_compartida DESC";

        $consulta = $this->conexion->prepare($sql);
        $consulta->bindValue(':id_usuario_destino', $userId, PDO::PARAM_INT);
        $consulta->execute();

        return array_map([$this, 'formatearCompartida'], $consulta->fetchAll());
    }

    public function reviewExistsAndIsVisible(int $reviewId): bool
    {
        $sql = "SELECT 1
                FROM resenas r
                INNER JOIN peliculas p ON p.id_pelicula = r.id_pelicula
                WHERE r.id_resena = :id_resena
                AND p.activo = 1
                LIMIT 1";

        $consulta = $this->conexion->prepare($sql);
        $consulta->bindValue(':id_resena', $reviewId, PDO::PARAM_INT);
        $consulta->execute();

        return (bool) $consulta->fetchColumn();
    }

    public function userExists(int $userId): bool
    {
        $sql = "SELECT 1
                FROM usuarios
                WHERE id_usuario = :id_usuario
                AND activo = 1
                LIMIT 1";

        $consulta = $this->conexion->prepare($sql);
        $consulta->bindValue(':id_usuario', $userId, PDO::PARAM_INT);
        $consulta->execute();

        return (bool) $consulta->fetchColumn();
    }

    public function alreadyShared(int $reviewId, int $senderId, int $recipientId): bool
    {
        $sql = "SELECT 1
                FROM resenas_compartidas
                WHERE id_resena = :id_resena
                AND id_usuario_remitente = :id_usuario_remitente
                AND id_usuario_destino = :id_usuario_destino
                LIMIT 1";

        $consulta = $this->conexion->prepare($sql);
        $consulta->bindValue(':id_resena', $reviewId, PDO::PARAM_INT);
        $consulta->bindValue(':id_usuario_remitente', $senderId, PDO::PARAM_INT);
        $consulta->bindValue(':id_usuario_destino', $recipientId, PDO::PARAM_INT);
        $consulta->execute();

        return (bool) $consulta->fetchColumn();
    }

    private function formatearUsuario(array $usuario): array
    {
        return [
            'id_usuario' => (int) $usuario['id_usuario'],
            'nombre_completo' => $usuario['nombre_completo'],
            'avatar' => $usuario['avatar']
        ];
    }

    private function formatearCompartida(array $compartida): array
    {
        return [
            'id_compartida' => (int) $compartida['id_compartida'],
            'fecha_compartida' => $compartida['fecha_compartida'],
            'remitente' => [
                'id_usuario' => (int) $compartida['remitente_id_usuario'],
                'nombre_completo' => $compartida['remitente_nombre_completo'],
                'avatar' => $compartida['remitente_avatar']
            ],
            'resena' => [
                'id_resena' => (int) $compartida['id_resena'],
                'frase_destacada' => $compartida['frase_destacada'],
                'contenido' => $compartida['contenido'],
                'puntuacion' => (int) $compartida['puntuacion'],
                'fecha_creacion' => $compartida['fecha_creacion'],
                'fecha_modificacion' => $compartida['fecha_modificacion'],
                'autor' => [
                    'id_usuario' => (int) $compartida['autor_id_usuario'],
                    'nombre_completo' => $compartida['autor_nombre_completo'],
                    'avatar' => $compartida['autor_avatar']
                ],
                'pelicula' => [
                    'id_pelicula' => (int) $compartida['id_pelicula'],
                    'titulo' => $compartida['titulo'],
                    'director' => $compartida['director'],
                    'anio' => (int) $compartida['anio'],
                    'imagen' => $compartida['imagen']
                ]
            ]
        ];
    }
}
