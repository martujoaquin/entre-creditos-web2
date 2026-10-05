<?php

class UsuarioController
{
    private Usuario $usuario;

    public function __construct(Usuario $usuario)
    {
        $this->usuario = $usuario;
    }

    public function listar(): array
    {
        return [
            'success' => true,
            'usuarios' => $this->usuario->obtenerTodosAdmin()
        ];
    }

    public function actualizar(array $datos, array $archivos, int $idUsuarioAutenticado): array
    {
        $hayAvatarNuevo = AuthController::hayArchivoNuevo($archivos['avatar'] ?? null);
        $idUsuario = $datos['id_usuario'] ?? '';

        if (!$this->idEsValido($idUsuario)) {
            http_response_code(404);
            return $this->error('El usuario no existe');
        }

        $idUsuario = (int) $idUsuario;
        $usuarioActual = $this->usuario->buscarAdminPorId($idUsuario);

        if ($usuarioActual === null) {
            http_response_code(404);
            return $this->error('El usuario no existe');
        }

        $validacion = $this->validarDatosActualizacion($datos, $hayAvatarNuevo);

        if ($validacion['success'] === false) {
            http_response_code(400);
            return $validacion;
        }

        $usuario = $validacion['usuario'];

        if (array_key_exists('email', $usuario)) {
            if ($this->usuario->buscarPorEmailExcluyendoId($usuario['email'], $idUsuario) !== null) {
                http_response_code(400);
                return $this->error('El email ya está registrado');
            }
        }

        if ($idUsuario === $idUsuarioAutenticado && array_key_exists('es_admin', $usuario) && (int) $usuario['es_admin'] !== 1) {
            http_response_code(400);
            return $this->error('No podés quitarte tus propios permisos de administrador.');
        }

        if ($idUsuario === $idUsuarioAutenticado && array_key_exists('activo', $usuario) && (int) $usuario['activo'] !== 1) {
            http_response_code(400);
            return $this->error('No podés inactivar tu propia cuenta.');
        }

        $avatarNuevo = null;

        if ($hayAvatarNuevo) {
            $avatarNuevo = AuthController::procesarAvatar($archivos['avatar']);

            if ($avatarNuevo['success'] === false) {
                http_response_code(400);
                return $avatarNuevo;
            }

            $usuario['avatar'] = $avatarNuevo['ruta'];
        }

        try {
            $actualizado = $this->usuario->actualizarAdmin($idUsuario, $usuario);
        } catch (Throwable $e) {
            $actualizado = false;
        }

        if (!$actualizado) {
            if (($avatarNuevo['ruta_absoluta'] ?? null) !== null && is_file($avatarNuevo['ruta_absoluta'])) {
                unlink($avatarNuevo['ruta_absoluta']);
            }

            http_response_code(500);
            return $this->error('No se pudo actualizar el usuario.');
        }

        if ($idUsuario === $idUsuarioAutenticado && array_key_exists('nombre_completo', $usuario)) {
            $_SESSION['nombre_completo'] = $usuario['nombre_completo'];
        }

        return [
            'success' => true,
            'message' => 'Usuario actualizado correctamente'
        ];
    }

    private function validarDatosActualizacion(array $datos, bool $hayAvatarNuevo): array
    {
        $camposPermitidos = ['nombre_completo', 'email', 'avatar', 'es_admin', 'activo'];
        $camposIgnorados = ['id_usuario', '_method', 'resource', 'action'];
        $usuario = [];

        foreach ($datos as $campo => $valor) {
            if (in_array($campo, $camposIgnorados, true)) {
                continue;
            }

            if (!in_array($campo, $camposPermitidos, true)) {
                return $this->error('Se recibieron campos no permitidos.');
            }

            $usuario[$campo] = is_string($valor) ? trim($valor) : $valor;
        }

        if (empty($usuario) && !$hayAvatarNuevo) {
            return $this->error('No se recibieron datos para actualizar.');
        }

        if (array_key_exists('nombre_completo', $usuario)) {
            $usuario['nombre_completo'] = $this->normalizarNombreCompleto((string) $usuario['nombre_completo']);

            if ($usuario['nombre_completo'] === '') {
                return $this->error('El nombre es obligatorio.');
            }

            if (mb_strlen($usuario['nombre_completo'], 'UTF-8') > 100) {
                return $this->error('El nombre no puede superar los 100 caracteres.');
            }
        }

        if (array_key_exists('email', $usuario)) {
            $usuario['email'] = trim((string) $usuario['email']);

            if ($usuario['email'] === '') {
                return $this->error('El email es obligatorio.');
            }

            if (!filter_var($usuario['email'], FILTER_VALIDATE_EMAIL)) {
                return $this->error('El email no es válido');
            }
        }

        if (array_key_exists('avatar', $usuario) && $usuario['avatar'] === '') {
            return $this->error('El avatar no puede estar vacío.');
        }

        if (array_key_exists('es_admin', $usuario)) {
            if (!$this->estadoEsValido($usuario['es_admin'])) {
                return $this->error('El rol de administrador debe ser 0 o 1.');
            }

            $usuario['es_admin'] = (int) $usuario['es_admin'];
        }

        if (array_key_exists('activo', $usuario)) {
            if (!$this->estadoEsValido($usuario['activo'])) {
                return $this->error('El estado debe ser 0 o 1.');
            }

            $usuario['activo'] = (int) $usuario['activo'];
        }

        return [
            'success' => true,
            'usuario' => $usuario
        ];
    }

    private function idEsValido($id): bool
    {
        return filter_var($id, FILTER_VALIDATE_INT, ['options' => ['min_range' => 1]]) !== false;
    }

    private function estadoEsValido($estado): bool
    {
        return $estado === 0 || $estado === 1 || $estado === '0' || $estado === '1';
    }

    private function normalizarNombreCompleto(string $nombreCompleto): string
    {
        return preg_replace('/\s+/u', ' ', trim($nombreCompleto)) ?? '';
    }

    private function error(string $mensaje): array
    {
        return [
            'success' => false,
            'message' => $mensaje
        ];
    }
}
