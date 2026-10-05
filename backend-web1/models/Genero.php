<?php

class Genero
{
    private PDO $conexion;

    public function __construct(PDO $conexion)
    {
        $this->conexion = $conexion;
    }

    public function contarTodos(): int
    {
        $consulta = $this->conexion->query("SELECT COUNT(*) AS total FROM generos");
        $resultado = $consulta->fetch();

        return (int) $resultado['total'];
    }

    public function obtenerTodos(): array
    {
        $consulta = $this->conexion->query("SELECT id_genero, nombre FROM generos ORDER BY nombre ASC");

        return $consulta->fetchAll();
    }

    public function buscarPorId(int $idGenero): ?array
    {
        $sql = "SELECT id_genero, nombre FROM generos WHERE id_genero = :id_genero LIMIT 1";
        $consulta = $this->conexion->prepare($sql);
        $consulta->bindValue(':id_genero', $idGenero, PDO::PARAM_INT);
        $consulta->execute();

        $genero = $consulta->fetch();

        return $genero ?: null;
    }

    public function buscarPorNombre(string $nombre): ?array
    {
        $sql = "SELECT id_genero, nombre FROM generos WHERE nombre = :nombre LIMIT 1";
        $consulta = $this->conexion->prepare($sql);
        $consulta->bindValue(':nombre', $nombre);
        $consulta->execute();

        $genero = $consulta->fetch();

        return $genero ?: null;
    }

    public function buscarPorNombreExcluyendoId(string $nombre, int $idGenero): ?array
    {
        $sql = "SELECT id_genero, nombre
                FROM generos
                WHERE nombre = :nombre
                AND id_genero <> :id_genero
                LIMIT 1";
        $consulta = $this->conexion->prepare($sql);
        $consulta->bindValue(':nombre', $nombre);
        $consulta->bindValue(':id_genero', $idGenero, PDO::PARAM_INT);
        $consulta->execute();

        $genero = $consulta->fetch();

        return $genero ?: null;
    }

    public function crear(string $nombre): bool
    {
        $sql = "INSERT INTO generos (nombre) VALUES (:nombre)";
        $consulta = $this->conexion->prepare($sql);

        return $consulta->execute([
            ':nombre' => $nombre
        ]);
    }

    public function actualizar(int $idGenero, string $nombre): bool
    {
        $sql = "UPDATE generos SET nombre = :nombre WHERE id_genero = :id_genero";
        $consulta = $this->conexion->prepare($sql);

        return $consulta->execute([
            ':nombre' => $nombre,
            ':id_genero' => $idGenero
        ]);
    }

    public function tienePeliculasAsociadas(int $idGenero): bool
    {
        $sql = "SELECT COUNT(*) AS total FROM peliculas WHERE id_genero = :id_genero";
        $consulta = $this->conexion->prepare($sql);
        $consulta->bindValue(':id_genero', $idGenero, PDO::PARAM_INT);
        $consulta->execute();
        $resultado = $consulta->fetch();

        return (int) $resultado['total'] > 0;
    }

    public function eliminar(int $idGenero): bool
    {
        $sql = "DELETE FROM generos WHERE id_genero = :id_genero";
        $consulta = $this->conexion->prepare($sql);
        $consulta->bindValue(':id_genero', $idGenero, PDO::PARAM_INT);

        return $consulta->execute();
    }
}
