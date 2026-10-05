<?php

class Pelicula
{
    private PDO $conexion;

    public function __construct(PDO $conexion)
    {
        $this->conexion = $conexion;
    }

    public function obtenerActivas(): array
    {
        return $this->obtenerPorEstado(true);
    }

    public function obtenerTodas(): array
    {
        return $this->obtenerPorEstado(false);
    }

    public function buscarPorId(int $idPelicula): ?array
    {
        $sql = "SELECT
                    id_pelicula,
                    titulo,
                    director,
                    anio,
                    sinopsis,
                    imagen,
                    id_genero,
                    activo
                FROM peliculas
                WHERE id_pelicula = :id_pelicula
                LIMIT 1";

        $consulta = $this->conexion->prepare($sql);
        $consulta->bindValue(':id_pelicula', $idPelicula, PDO::PARAM_INT);
        $consulta->execute();

        $pelicula = $consulta->fetch();

        return $pelicula ?: null;
    }

    public function buscarPorTituloYAnio(string $titulo, int $anio): ?array
    {
        $sql = "SELECT
                    id_pelicula,
                    titulo,
                    director,
                    anio,
                    sinopsis,
                    imagen,
                    id_genero,
                    activo
                FROM peliculas
                WHERE LOWER(titulo) = LOWER(:titulo)
                AND anio = :anio
                LIMIT 1";

        $consulta = $this->conexion->prepare($sql);
        $consulta->bindValue(':titulo', $titulo);
        $consulta->bindValue(':anio', $anio, PDO::PARAM_INT);
        $consulta->execute();

        $pelicula = $consulta->fetch();

        return $pelicula ?: null;
    }

    public function crear(array $datos): bool
    {
        $sql = "INSERT INTO peliculas (
                    titulo,
                    director,
                    anio,
                    sinopsis,
                    imagen,
                    id_genero,
                    activo
                ) VALUES (
                    :titulo,
                    :director,
                    :anio,
                    :sinopsis,
                    :imagen,
                    :id_genero,
                    :activo
                )";

        $consulta = $this->conexion->prepare($sql);

        return $consulta->execute([
            ':titulo' => $datos['titulo'],
            ':director' => $datos['director'],
            ':anio' => $datos['anio'],
            ':sinopsis' => $datos['sinopsis'],
            ':imagen' => $datos['imagen'],
            ':id_genero' => $datos['id_genero'],
            ':activo' => $datos['activo']
        ]);
    }

    public function actualizar(int $idPelicula, array $datos): bool
    {
        $campos = [];
        $parametros = [
            ':id_pelicula' => $idPelicula
        ];

        foreach ($datos as $campo => $valor) {
            $campos[] = "$campo = :$campo";
            $parametros[":$campo"] = $valor;
        }

        $sql = "UPDATE peliculas SET " . implode(', ', $campos) . " WHERE id_pelicula = :id_pelicula";
        $consulta = $this->conexion->prepare($sql);

        return $consulta->execute($parametros);
    }

    private function obtenerPorEstado(bool $soloActivas): array
    {
        $sql = "SELECT
                    id_pelicula,
                    titulo,
                    director,
                    anio,
                    sinopsis,
                    imagen,
                    id_genero,
                    activo
                FROM peliculas";

        if ($soloActivas) {
            $sql .= " WHERE activo = 1";
        }

        $sql .= " ORDER BY titulo ASC";

        $consulta = $this->conexion->query($sql);

        return $consulta->fetchAll();
    }
}
