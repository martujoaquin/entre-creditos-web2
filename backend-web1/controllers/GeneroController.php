<?php

class GeneroController
{
    private Genero $genero;

    public function __construct(Genero $genero)
    {
        $this->genero = $genero;
    }

    public function estadoConexion(): array
    {
        return [
            'success' => true,
            'message' => 'Backend conectado correctamente',
            'generos' => $this->genero->contarTodos()
        ];
    }

    public function listar(): array
    {
        return [
            'success' => true,
            'generos' => $this->genero->obtenerTodos()
        ];
    }

    public function crear(?array $datos = null): array
    {
        $datos = $datos ?? $_POST;
        $nombre = trim($datos['nombre'] ?? '');

        if ($nombre === '') {
            return [
                'success' => false,
                'message' => 'El nombre del género es obligatorio'
            ];
        }

        if ($this->genero->buscarPorNombre($nombre) !== null) {
            return [
                'success' => false,
                'message' => 'El género ya existe'
            ];
        }

        $this->genero->crear($nombre);

        return [
            'success' => true,
            'message' => 'Género creado correctamente'
        ];
    }

    public function actualizar(?array $datos = null): array
    {
        $datos = $datos ?? $_POST;
        $idGenero = $datos['id_genero'] ?? '';
        $nombre = trim($datos['nombre'] ?? '');

        if (!$this->idEsValido($idGenero)) {
            return [
                'success' => false,
                'message' => 'El género no existe'
            ];
        }

        if ($nombre === '') {
            return [
                'success' => false,
                'message' => 'El nombre del género es obligatorio'
            ];
        }

        $idGenero = (int) $idGenero;

        if ($this->genero->buscarPorId($idGenero) === null) {
            return [
                'success' => false,
                'message' => 'El género no existe'
            ];
        }

        if ($this->genero->buscarPorNombreExcluyendoId($nombre, $idGenero) !== null) {
            return [
                'success' => false,
                'message' => 'El género ya existe'
            ];
        }

        $this->genero->actualizar($idGenero, $nombre);

        return [
            'success' => true,
            'message' => 'Género actualizado correctamente'
        ];
    }

    public function eliminar(?array $datos = null): array
    {
        $datos = $datos ?? $_POST;
        $idGenero = $datos['id_genero'] ?? '';

        if (!$this->idEsValido($idGenero)) {
            return [
                'success' => false,
                'message' => 'El género no existe'
            ];
        }

        $idGenero = (int) $idGenero;

        if ($this->genero->buscarPorId($idGenero) === null) {
            return [
                'success' => false,
                'message' => 'El género no existe'
            ];
        }

        if ($this->genero->tienePeliculasAsociadas($idGenero)) {
            return [
                'success' => false,
                'message' => 'No se puede eliminar el género porque está asociado a una película'
            ];
        }

        $this->genero->eliminar($idGenero);

        return [
            'success' => true,
            'message' => 'Género eliminado correctamente'
        ];
    }

    private function idEsValido($id): bool
    {
        return filter_var($id, FILTER_VALIDATE_INT, ['options' => ['min_range' => 1]]) !== false;
    }
}
