<?php

class PeliculaController
{
    private Pelicula $pelicula;
    private Genero $genero;

    public function __construct(Pelicula $pelicula, Genero $genero)
    {
        $this->pelicula = $pelicula;
        $this->genero = $genero;
    }

    public function listar(bool $incluirInactivas = false): array
    {
        return [
            'success' => true,
            'peliculas' => $incluirInactivas
                ? $this->pelicula->obtenerTodas()
                : $this->pelicula->obtenerActivas()
        ];
    }

    public function crear(?array $datos = null, ?array $archivos = null): array
    {
        $datos = $datos ?? $_POST;
        $archivos = $archivos ?? $_FILES;
        $validacion = $this->validarDatosCreacion($datos);

        if ($validacion['success'] === false) {
            return $validacion;
        }

        $duplicada = $this->pelicula->buscarPorTituloYAnio(
            $validacion['pelicula']['titulo'],
            $validacion['pelicula']['anio']
        );

        if ($duplicada !== null) {
            return [
                'success' => false,
                'message' => 'La película ya se encuentra registrada.'
            ];
        }

        $imagen = $this->procesarImagen($archivos['imagen'] ?? null, false);

        if ($imagen['success'] === false) {
            return $imagen;
        }

        $validacion['pelicula']['imagen'] = $imagen['ruta'] ?? 'uploads/peliculas/default-poster.png';

        try {
            $creada = $this->pelicula->crear($validacion['pelicula']);
        } catch (Throwable $e) {
            $creada = false;
        }

        if (!$creada) {
            if (($imagen['ruta_absoluta'] ?? null) !== null && is_file($imagen['ruta_absoluta'])) {
                unlink($imagen['ruta_absoluta']);
            }

            return [
                'success' => false,
                'message' => 'No se pudo crear la película.'
            ];
        }

        return [
            'success' => true,
            'message' => 'Película creada correctamente'
        ];
    }

    public function actualizar(?array $datos = null, ?array $archivos = null): array
    {
        $datos = $datos ?? $_POST;
        $archivos = $archivos ?? $_FILES;
        $hayImagenNueva = $this->hayImagenNueva($archivos['imagen'] ?? null);
        $idPelicula = $datos['id_pelicula'] ?? '';

        if (!$this->idEsValido($idPelicula)) {
            return [
                'success' => false,
                'message' => 'La película no existe'
            ];
        }

        $idPelicula = (int) $idPelicula;
        $peliculaActual = $this->pelicula->buscarPorId($idPelicula);

        if ($peliculaActual === null) {
            return [
                'success' => false,
                'message' => 'La película no existe'
            ];
        }

        $validacion = $this->validarDatosActualizacion($datos, $hayImagenNueva);

        if ($validacion['success'] === false) {
            return $validacion;
        }

        $pelicula = $validacion['pelicula'];

        if (array_key_exists('titulo', $pelicula) || array_key_exists('anio', $pelicula)) {
            $tituloDuplicado = $pelicula['titulo'] ?? $peliculaActual['titulo'];
            $anioDuplicado = $pelicula['anio'] ?? (int) $peliculaActual['anio'];
            $duplicada = $this->pelicula->buscarPorTituloYAnio($tituloDuplicado, (int) $anioDuplicado);

            if ($duplicada !== null && (int) $duplicada['id_pelicula'] !== $idPelicula) {
                return [
                    'success' => false,
                    'message' => 'Ya existe otra película con ese título y año.'
                ];
            }
        }

        if (array_key_exists('activo', $pelicula)) {
            $activoActual = (int) $peliculaActual['activo'];
            $activoNuevo = (int) $pelicula['activo'];

            if ($activoActual === $activoNuevo) {
                return [
                    'success' => false,
                    'message' => $activoNuevo === 1
                        ? 'La película ya se encuentra activa.'
                        : 'La película ya se encuentra inactiva.'
                ];
            }
        }

        $imagenNueva = null;

        if ($hayImagenNueva) {
            $imagenNueva = $this->procesarImagen($archivos['imagen'], false);

            if ($imagenNueva['success'] === false) {
                return $imagenNueva;
            }

            $pelicula['imagen'] = $imagenNueva['ruta'];
        }

        try {
            $actualizada = $this->pelicula->actualizar($idPelicula, $pelicula);
        } catch (Throwable $e) {
            $actualizada = false;
        }

        if (!$actualizada) {
            if ($imagenNueva !== null && is_file($imagenNueva['ruta_absoluta'])) {
                unlink($imagenNueva['ruta_absoluta']);
            }

            return [
                'success' => false,
                'message' => 'No se pudo actualizar la película.'
            ];
        }

        if ($imagenNueva !== null) {
            $this->eliminarImagenAnterior($peliculaActual['imagen'] ?? '');
        }

        return [
            'success' => true,
            'message' => 'Película actualizada correctamente'
        ];
    }

    private function validarDatosCreacion(array $datos): array
    {
        $pelicula = [
            'titulo' => trim($datos['titulo'] ?? ''),
            'director' => trim($datos['director'] ?? ''),
            'anio' => trim($datos['anio'] ?? ''),
            'sinopsis' => trim($datos['sinopsis'] ?? ''),
            'imagen' => '',
            'id_genero' => trim($datos['id_genero'] ?? ''),
            'activo' => $datos['activo'] ?? 1
        ];

        if ($pelicula['titulo'] === '') {
            return $this->error('El título es obligatorio.');
        }

        if ($pelicula['director'] === '') {
            return $this->error('El director es obligatorio.');
        }

        if ($pelicula['anio'] === '') {
            return $this->error('El año es obligatorio.');
        }

        if (!$this->anioEsValido($pelicula['anio'])) {
            return $this->error('El año ingresado no es válido.');
        }

        if (!$this->idEsValido($pelicula['id_genero'])) {
            return $this->error('El género seleccionado no existe.');
        }

        $pelicula['id_genero'] = (int) $pelicula['id_genero'];

        if ($this->genero->buscarPorId($pelicula['id_genero']) === null) {
            return $this->error('El género seleccionado no existe.');
        }

        if (!$this->estadoEsValido($pelicula['activo'])) {
            return $this->error('El estado debe ser 0 o 1.');
        }

        $pelicula['anio'] = (int) $pelicula['anio'];
        $pelicula['activo'] = (int) $pelicula['activo'];

        return [
            'success' => true,
            'pelicula' => $pelicula
        ];
    }

    private function validarDatosActualizacion(array $datos, bool $hayImagenNueva = false): array
    {
        $camposPermitidos = ['titulo', 'director', 'anio', 'sinopsis', 'imagen', 'id_genero', 'activo'];
        $pelicula = [];

        foreach ($camposPermitidos as $campo) {
            if (array_key_exists($campo, $datos)) {
                $valor = is_string($datos[$campo]) ? trim($datos[$campo]) : $datos[$campo];
                $pelicula[$campo] = $valor;
            }
        }

        if (empty($pelicula) && !$hayImagenNueva) {
            return $this->error('No se recibieron datos para actualizar.');
        }

        if (array_key_exists('titulo', $pelicula) && $pelicula['titulo'] === '') {
            return $this->error('El título es obligatorio.');
        }

        if (array_key_exists('director', $pelicula) && $pelicula['director'] === '') {
            return $this->error('El director es obligatorio.');
        }

        if (array_key_exists('anio', $pelicula)) {
            if (!$this->anioEsValido($pelicula['anio'])) {
                return $this->error('El año ingresado no es válido.');
            }

            $pelicula['anio'] = (int) $pelicula['anio'];
        }

        if (array_key_exists('id_genero', $pelicula)) {
            if (!$this->idEsValido($pelicula['id_genero'])) {
                return $this->error('El género seleccionado no existe.');
            }

            $pelicula['id_genero'] = (int) $pelicula['id_genero'];

            if ($this->genero->buscarPorId($pelicula['id_genero']) === null) {
                return $this->error('El género seleccionado no existe.');
            }
        }

        if (array_key_exists('activo', $pelicula)) {
            if (!$this->estadoEsValido($pelicula['activo'])) {
                return $this->error('El estado debe ser 0 o 1.');
            }

            $pelicula['activo'] = (int) $pelicula['activo'];
        }

        return [
            'success' => true,
            'pelicula' => $pelicula
        ];
    }

    private function idEsValido($id): bool
    {
        return filter_var($id, FILTER_VALIDATE_INT, ['options' => ['min_range' => 1]]) !== false;
    }

    private function anioEsValido($anio): bool
    {
        if (filter_var($anio, FILTER_VALIDATE_INT) === false) {
            return false;
        }

        $anio = (int) $anio;
        $anioActual = (int) date('Y');

        return $anio >= 1888 && $anio <= $anioActual;
    }

    private function estadoEsValido($activo): bool
    {
        return $activo === 0 || $activo === 1 || $activo === '0' || $activo === '1';
    }

    private function procesarImagen(?array $imagen, bool $obligatoria): array
    {
        if ($imagen === null || ($imagen['error'] ?? UPLOAD_ERR_NO_FILE) === UPLOAD_ERR_NO_FILE) {
            return $obligatoria
                ? $this->error('La imagen es obligatoria.')
                : [
                    'success' => true,
                    'ruta' => null,
                    'ruta_absoluta' => null
                ];
        }

        if (($imagen['error'] ?? UPLOAD_ERR_OK) !== UPLOAD_ERR_OK) {
            return $this->error('No se pudo guardar la imagen.');
        }

        if (($imagen['size'] ?? 0) > 2 * 1024 * 1024) {
            return $this->error('La imagen supera el tamaño máximo permitido.');
        }

        $finfo = new finfo(FILEINFO_MIME_TYPE);
        $mime = $finfo->file($imagen['tmp_name']);
        $tiposPermitidos = [
            'image/jpeg' => 'jpg',
            'image/png' => 'png',
            'image/webp' => 'webp'
        ];

        if (!array_key_exists($mime, $tiposPermitidos)) {
            return $this->error('El formato de imagen no es válido.');
        }

        $directorio = __DIR__ . '/../uploads/peliculas/';
        $nombreArchivo = 'pelicula_' . bin2hex(random_bytes(8)) . '.' . $tiposPermitidos[$mime];
        $rutaAbsoluta = $directorio . $nombreArchivo;
        $rutaRelativa = 'uploads/peliculas/' . $nombreArchivo;

        if (!move_uploaded_file($imagen['tmp_name'], $rutaAbsoluta)) {
            return $this->error('No se pudo guardar la imagen.');
        }

        return [
            'success' => true,
            'ruta' => $rutaRelativa,
            'ruta_absoluta' => $rutaAbsoluta
        ];
    }

    private function hayImagenNueva(?array $imagen): bool
    {
        return $imagen !== null && ($imagen['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_NO_FILE;
    }

    private function eliminarImagenAnterior(string $rutaRelativa): void
    {
        if ($rutaRelativa === '') {
            return;
        }

        $rutaRelativa = str_replace('\\', '/', $rutaRelativa);

        if (strpos($rutaRelativa, 'uploads/peliculas/') !== 0) {
            return;
        }

        $directorioBase = realpath(__DIR__ . '/../uploads/peliculas');
        $rutaAbsoluta = realpath(__DIR__ . '/../' . $rutaRelativa);

        if ($directorioBase === false || $rutaAbsoluta === false) {
            return;
        }

        if (strpos($rutaAbsoluta, $directorioBase . DIRECTORY_SEPARATOR) !== 0) {
            return;
        }

        if (is_file($rutaAbsoluta)) {
            unlink($rutaAbsoluta);
        }
    }

    private function error(string $mensaje): array
    {
        return [
            'success' => false,
            'message' => $mensaje
        ];
    }
}
