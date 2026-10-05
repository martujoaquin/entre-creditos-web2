<?php

class DevelopmentController
{
    private PDO $conexion;

    public function __construct(PDO $conexion)
    {
        $this->conexion = $conexion;
    }

    public function resetDatabase(array $datos): array
    {
        if (($datos['confirmacion'] ?? '') !== 'RESET') {
            return [
                'success' => false,
                'message' => 'Confirmación inválida'
            ];
        }

        try {
            $this->conexion->beginTransaction();
            $this->conexion->exec('SET FOREIGN_KEY_CHECKS = 0');

            $this->limpiarTablas();
            $this->restaurarDatosIniciales();

            $this->conexion->exec('SET FOREIGN_KEY_CHECKS = 1');
            $this->conexion->commit();

            $this->reiniciarAutoIncrement();

            return [
                'success' => true,
                'message' => 'Base de datos restaurada correctamente'
            ];
        } catch (Throwable $e) {
            if ($this->conexion->inTransaction()) {
                $this->conexion->rollBack();
            }

            $this->conexion->exec('SET FOREIGN_KEY_CHECKS = 1');

            return [
                'success' => false,
                'message' => 'No se pudo restaurar la base de datos'
            ];
        }
    }

    private function limpiarTablas(): void
    {
        $this->conexion->exec('DELETE FROM resenas_compartidas');
        $this->conexion->exec('DELETE FROM resenas');
        $this->conexion->exec('DELETE FROM peliculas');
        $this->conexion->exec('DELETE FROM usuarios');
        $this->conexion->exec('DELETE FROM generos');
    }

    private function restaurarDatosIniciales(): void
    {
        $generos = [
            [1, 'Acción'],
            [2, 'Animación'],
            [3, 'Ciencia ficción'],
            [4, 'Comedia'],
            [5, 'Crimen'],
            [6, 'Drama'],
            [7, 'Fantasía'],
            [8, 'Terror'],
            [9, 'Thriller']
        ];

        $consultaGenero = $this->conexion->prepare(
            'INSERT INTO generos (id_genero, nombre) VALUES (:id_genero, :nombre)'
        );

        foreach ($generos as $genero) {
            $consultaGenero->execute([
                ':id_genero' => $genero[0],
                ':nombre' => $genero[1]
            ]);
        }

        $sqlUsuario = "INSERT INTO usuarios (
                            id_usuario,
                            nombre_completo,
                            email,
                            password_hash,
                            es_admin,
                            activo
                        ) VALUES (
                            1,
                            :nombre_completo,
                            :email,
                            :password_hash,
                            1,
                            1
                        )";

        $consultaUsuario = $this->conexion->prepare($sqlUsuario);
        $consultaUsuario->execute([
            ':nombre_completo' => 'Administrador Entre Créditos',
            ':email' => 'admin@entrecreditos.com',
            ':password_hash' => '$2y$12$JPat0S/gAwbPVrU53JYoS.N7NG1cvkKym0/N7Ez7nYvGB/G6mKULi'
        ]);
    }

    private function reiniciarAutoIncrement(): void
    {
        $this->conexion->exec('ALTER TABLE resenas_compartidas AUTO_INCREMENT = 1');
        $this->conexion->exec('ALTER TABLE resenas AUTO_INCREMENT = 1');
        $this->conexion->exec('ALTER TABLE peliculas AUTO_INCREMENT = 1');
        $this->conexion->exec('ALTER TABLE usuarios AUTO_INCREMENT = 2');
        $this->conexion->exec('ALTER TABLE generos AUTO_INCREMENT = 10');
    }
}
