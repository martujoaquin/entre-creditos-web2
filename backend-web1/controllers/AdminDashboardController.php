<?php

class AdminDashboardController
{
    private PDO $conexion;

    public function __construct(PDO $conexion)
    {
        $this->conexion = $conexion;
    }

    public function resumen(): array
    {
        return [
            'peliculas_activas' => $this->contarPeliculasActivas(),
            'generos' => $this->contarGeneros(),
            'usuarios' => $this->contarUsuarios(),
            'resenas' => $this->contarResenasPublicadas()
        ];
    }

    private function contarPeliculasActivas(): int
    {
        $consulta = $this->conexion->query('SELECT COUNT(*) FROM peliculas WHERE activo = 1');

        return (int) $consulta->fetchColumn();
    }

    private function contarGeneros(): int
    {
        $consulta = $this->conexion->query('SELECT COUNT(*) FROM generos');

        return (int) $consulta->fetchColumn();
    }

    private function contarUsuarios(): int
    {
        $consulta = $this->conexion->query('SELECT COUNT(*) FROM usuarios');

        return (int) $consulta->fetchColumn();
    }

    private function contarResenasPublicadas(): int
    {
        $sql = 'SELECT COUNT(r.id_resena)
                FROM resenas r
                INNER JOIN peliculas p ON p.id_pelicula = r.id_pelicula
                WHERE p.activo = 1';
        $consulta = $this->conexion->query($sql);

        return (int) $consulta->fetchColumn();
    }
}
