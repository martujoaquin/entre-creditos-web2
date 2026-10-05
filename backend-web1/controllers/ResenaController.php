<?php

class ResenaController
{
    private Resena $resena;
    private Pelicula $pelicula;

    public function __construct(Resena $resena, Pelicula $pelicula)
    {
        $this->resena = $resena;
        $this->pelicula = $pelicula;
    }

    public function listarPorPelicula(array $datos): array
    {
        $idPelicula = $datos['id_pelicula'] ?? '';

        if (!$this->idEsValido($idPelicula)) {
            http_response_code(400);
            return $this->error('La película es obligatoria.');
        }

        $pelicula = $this->pelicula->buscarPorId((int) $idPelicula);

        if ($pelicula === null || (int) $pelicula['activo'] !== 1) {
            http_response_code(404);
            return $this->error('La película no está disponible.');
        }

        return [
            'success' => true,
            'resenas' => $this->resena->getByMovie((int) $idPelicula)
        ];
    }

    public function listarAdmin(): array
    {
        try {
            $resenas = $this->resena->obtenerTodasAdmin();
        } catch (Throwable $e) {
            http_response_code(500);
            return $this->error('No se pudieron cargar las reseñas.');
        }

        return [
            'success' => true,
            'resenas' => $resenas
        ];
    }

    public function listarLanding(): array
    {
        try {
            $resenas = $this->resena->obtenerUltimasLanding(3);
        } catch (Throwable $e) {
            http_response_code(500);
            return $this->error('No se pudieron cargar las reseñas.');
        }

        return [
            'success' => true,
            'resenas' => $resenas
        ];
    }

    public function obtenerPorId(array $datos, int $idUsuario, bool $esAdmin): array
    {
        $idResena = $datos['id_resena'] ?? '';

        if (!$this->idEsValido($idResena)) {
            http_response_code(400);
            return $this->error('La reseña es obligatoria.');
        }

        $resena = $this->resena->findById((int) $idResena);

        if ($resena === null) {
            http_response_code(404);
            return $this->error('La reseña no existe.');
        }

        if (!$esAdmin && (int) $resena['id_usuario'] !== $idUsuario) {
            http_response_code(403);
            return $this->error('No tiene permisos para ver esta reseña.');
        }

        return [
            'success' => true,
            'resena' => $resena
        ];
    }

    public function crear(array $datos, int $idUsuario): array
    {
        $validacion = $this->validarDatos($datos, true);

        if ($validacion['success'] === false) {
            return $validacion;
        }

        $idPelicula = $validacion['id_pelicula'];
        $pelicula = $this->pelicula->buscarPorId($idPelicula);

        if ($pelicula === null) {
            http_response_code(404);
            return $this->error('La película no existe.');
        }

        if ((int) $pelicula['activo'] !== 1) {
            http_response_code(400);
            return $this->error('No se pueden crear reseñas para películas inactivas.');
        }

        if ($this->resena->existsForUserAndMovie($idUsuario, $idPelicula)) {
            http_response_code(409);
            return $this->error('Ya publicaste una reseña para esta película.');
        }

        try {
            $resena = $this->resena->create($idUsuario, $idPelicula, $validacion['resena']);
        } catch (PDOException $e) {
            if ($e->getCode() === '23000') {
                http_response_code(409);
                return $this->error('Ya publicaste una reseña para esta película.');
            }

            http_response_code(500);
            return $this->error('No se pudo crear la reseña.');
        }

        http_response_code(201);

        return [
            'success' => true,
            'message' => 'Reseña creada correctamente',
            'resena' => $resena
        ];
    }

    public function actualizar(array $datos, int $idUsuario, bool $esAdmin): array
    {
        $idResena = $datos['id_resena'] ?? '';

        if (!$this->idEsValido($idResena)) {
            http_response_code(400);
            return $this->error('La reseña es obligatoria.');
        }

        $resenaActual = $this->resena->findById((int) $idResena);

        if ($resenaActual === null) {
            http_response_code(404);
            return $this->error('La reseña no existe.');
        }

        if (!$esAdmin && (int) $resenaActual['id_usuario'] !== $idUsuario) {
            http_response_code(403);
            return $this->error('No tiene permisos para editar esta reseña.');
        }

        $validacion = $this->validarDatos($datos, false);

        if ($validacion['success'] === false) {
            return $validacion;
        }

        try {
            $resena = $this->resena->update((int) $idResena, $idUsuario, $esAdmin, $validacion['resena']);
        } catch (Throwable $e) {
            http_response_code(500);
            return $this->error('No se pudo actualizar la reseña.');
        }

        return [
            'success' => true,
            'message' => 'Reseña actualizada correctamente',
            'resena' => $resena
        ];
    }

    public function eliminar(array $datos, int $idUsuario, bool $esAdmin): array
    {
        $idResena = $datos['id_resena'] ?? '';

        if (!$this->idEsValido($idResena)) {
            http_response_code(400);
            return $this->error('La reseña es obligatoria.');
        }

        $resenaActual = $this->resena->findById((int) $idResena);

        if ($resenaActual === null) {
            http_response_code(404);
            return $this->error('La reseña no existe.');
        }

        if (!$esAdmin && (int) $resenaActual['id_usuario'] !== $idUsuario) {
            http_response_code(403);
            return $this->error('No tiene permisos para eliminar esta reseña.');
        }

        try {
            $eliminada = $this->resena->delete((int) $idResena, $idUsuario, $esAdmin);
        } catch (Throwable $e) {
            http_response_code(500);
            return $this->error('No se pudo eliminar la reseña.');
        }

        if (!$eliminada) {
            http_response_code(500);
            return $this->error('No se pudo eliminar la reseña.');
        }

        return [
            'success' => true,
            'message' => 'Reseña eliminada correctamente'
        ];
    }

    private function validarDatos(array $datos, bool $requierePelicula): array
    {
        $idPelicula = $datos['id_pelicula'] ?? null;
        $fraseDestacada = array_key_exists('frase_destacada', $datos)
            ? trim((string) $datos['frase_destacada'])
            : null;
        $contenido = trim((string) ($datos['contenido'] ?? ''));
        $puntuacion = $datos['puntuacion'] ?? null;

        if ($requierePelicula && !$this->idEsValido($idPelicula)) {
            http_response_code(400);
            return $this->error('La película es obligatoria.');
        }

        if ($contenido === '') {
            http_response_code(400);
            return $this->error('El contenido es obligatorio.');
        }

        if (filter_var($puntuacion, FILTER_VALIDATE_INT) === false) {
            http_response_code(400);
            return $this->error('La puntuación es obligatoria.');
        }

        $puntuacion = (int) $puntuacion;

        if ($puntuacion < 1 || $puntuacion > 5) {
            http_response_code(400);
            return $this->error('La puntuación debe estar entre 1 y 5.');
        }

        if ($fraseDestacada !== null && mb_strlen($fraseDestacada) > 220) {
            http_response_code(400);
            return $this->error('La frase destacada no puede superar los 220 caracteres.');
        }

        return [
            'success' => true,
            'id_pelicula' => $idPelicula !== null ? (int) $idPelicula : null,
            'resena' => [
                'frase_destacada' => $fraseDestacada === '' ? null : $fraseDestacada,
                'contenido' => $contenido,
                'puntuacion' => $puntuacion
            ]
        ];
    }

    private function idEsValido($id): bool
    {
        return filter_var($id, FILTER_VALIDATE_INT, ['options' => ['min_range' => 1]]) !== false;
    }

    private function error(string $mensaje): array
    {
        return [
            'success' => false,
            'message' => $mensaje
        ];
    }
}
