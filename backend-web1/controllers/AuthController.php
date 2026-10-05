<?php

class AuthController
{
    private Usuario $usuario;

    public function __construct(Usuario $usuario)
    {
        $this->usuario = $usuario;
    }

    public function registrar(): array
    {
        $nombreCompleto = $this->normalizarNombreCompleto($_POST['nombre_completo'] ?? '');
        $email = trim($_POST['email'] ?? '');
        $password = $_POST['password'] ?? '';
        $confirmPassword = $_POST['confirm_password'] ?? '';

        if (!$this->nombreCompletoEsValido($nombreCompleto)) {
            http_response_code(400);
            return [
                'success' => false,
                'message' => 'Ingresá un nombre y apellido válidos.'
            ];
        }

        if ($nombreCompleto === '' || $email === '' || $password === '' || $confirmPassword === '') {
            return [
                'success' => false,
                'message' => 'Complete todos los campos obligatorios'
            ];
        }

        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            return [
                'success' => false,
                'message' => 'El email no es válido'
            ];
        }

        if($password !== $confirmPassword) {
            return [
                'success' => false,
                'message' => 'Las contraseñas no coinciden'
            ];
        }

        if (!$this->passwordEsSegura($password)) {
            return [
                'success' => false,
                'message' => 'La contraseña no cumple los requisitos de seguridad'
            ];
        }

        if ($this->usuario->buscarPorEmail($email) !== null) {
            return [
                'success' => false,
                'message' => 'El email ya está registrado'
            ];
        }

        $this->usuario->registrar($nombreCompleto, $email, $password);

        return [
            'success' => true,
            'message' => 'Usuario registrado correctamente'
        ];
    }

    public function login(): array
    {
        $email = trim($_POST['email'] ?? '');
        $password = $_POST['password'] ?? '';

        if ($email === '' || $password === '') {
            return [
                'success' => false,
                'message' => 'Complete todos los campos obligatorios'
            ];
        }

        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            return [
                'success' => false,
                'message' => 'El email no es válido'
            ];
        }

        $usuario = $this->usuario->buscarPorEmail($email);

        if ($usuario === null || !password_verify($password, $usuario['password_hash'])) {
            return [
                'success' => false,
                'message' => 'Email o contraseña incorrectos'
            ];
        }

        if ((int) $usuario['activo'] !== 1) {
            return [
                'success' => false,
                'message' => 'El usuario se encuentra inactivo'
            ];
        }

        $_SESSION['id_usuario'] = (int) $usuario['id_usuario'];
        $_SESSION['nombre_completo'] = $usuario['nombre_completo'];
        $_SESSION['es_admin'] = (int) $usuario['es_admin'];

        return [
            'success' => true,
            'message' => 'Inicio de sesión correcto',
            'usuario' => [
                'id_usuario' => (int) $usuario['id_usuario'],
                'nombre_completo' => $usuario['nombre_completo'],
                'email' => $usuario['email'],
                'es_admin' => (int) $usuario['es_admin'],
                'avatar' => $usuario['avatar'],
                'fecha_registro' => $usuario['fecha_registro']
            ]
        ];
    }

    public function me(): array
    {
        if (!isset($_SESSION['id_usuario'])) {
            return [
                'success' => false,
                'message' => 'No hay una sesión activa'
            ];
        }

        $usuario = $this->usuario->buscarPublicoPorId((int) $_SESSION['id_usuario']);

        if ($usuario === null) {
            return [
                'success' => false,
                'message' => 'No hay una sesión activa'
            ];
        }

        return [
            'success' => true,
            'usuario' => [
                'id_usuario' => (int) $usuario['id_usuario'],
                'nombre_completo' => $usuario['nombre_completo'],
                'email' => $usuario['email'],
                'es_admin' => (int) $usuario['es_admin'],
                'avatar' => $usuario['avatar'],
                'fecha_registro' => $usuario['fecha_registro']
            ]
        ];
    }

    public function perfil(): array
    {
        if (!isset($_SESSION['id_usuario'])) {
            http_response_code(401);
            return [
                'success' => false,
                'message' => 'Debe iniciar sesión'
            ];
        }

        $usuario = $this->usuario->buscarPublicoPorId((int) $_SESSION['id_usuario']);

        if ($usuario === null) {
            http_response_code(401);
            return [
                'success' => false,
                'message' => 'No hay una sesión activa'
            ];
        }

        return [
            'success' => true,
            'data' => [
                'usuario' => [
                    'id_usuario' => (int) $usuario['id_usuario'],
                    'nombre_completo' => $usuario['nombre_completo'],
                    'email' => $usuario['email'],
                    'es_admin' => (int) $usuario['es_admin'],
                    'avatar' => $usuario['avatar'],
                    'fecha_registro' => $usuario['fecha_registro']
                ],
                'estadisticas' => $this->usuario->obtenerEstadisticasPerfil((int) $usuario['id_usuario'])
            ]
        ];
    }

    public function actualizarPerfil(?array $datos = null, ?array $archivos = null): array
    {
        if (!isset($_SESSION['id_usuario'])) {
            http_response_code(401);
            return [
                'success' => false,
                'message' => 'Debe iniciar sesión'
            ];
        }

        $datos = $datos ?? $_POST;
        $archivos = $archivos ?? $_FILES;
        $idUsuario = (int) $_SESSION['id_usuario'];
        $usuarioActual = $this->usuario->buscarPublicoPorId($idUsuario);

        if ($usuarioActual === null) {
            http_response_code(401);
            return [
                'success' => false,
                'message' => 'No hay una sesión activa'
            ];
        }

        $nombreCompleto = $this->normalizarNombreCompleto($datos['nombre_completo'] ?? '');

        if (!$this->nombreCompletoEsValido($nombreCompleto)) {
            http_response_code(400);
            return [
                'success' => false,
                'message' => 'Ingresá un nombre y apellido válidos.'
            ];
        }

        if (mb_strlen($nombreCompleto, 'UTF-8') > 100) {
            http_response_code(400);
            return [
                'success' => false,
                'message' => 'El nombre no puede superar los 100 caracteres.'
            ];
        }

        $avatarNuevo = null;
        $hayAvatarNuevo = $this->hayArchivoNuevo($archivos['avatar'] ?? null);

        if ($hayAvatarNuevo) {
            $avatarNuevo = $this->procesarAvatar($archivos['avatar']);

            if ($avatarNuevo['success'] === false) {
                http_response_code(400);
                return $avatarNuevo;
            }
        }

        try {
            $actualizado = $this->usuario->actualizarPerfil(
                $idUsuario,
                $nombreCompleto,
                $avatarNuevo['ruta'] ?? null
            );
        } catch (Throwable $e) {
            $actualizado = false;
        }

        if (!$actualizado) {
            if (($avatarNuevo['ruta_absoluta'] ?? null) !== null && is_file($avatarNuevo['ruta_absoluta'])) {
                unlink($avatarNuevo['ruta_absoluta']);
            }

            http_response_code(500);
            return [
                'success' => false,
                'message' => 'No se pudo actualizar el perfil.'
            ];
        }

        $_SESSION['nombre_completo'] = $nombreCompleto;
        $usuario = $this->usuario->buscarPublicoPorId($idUsuario);

        return [
            'success' => true,
            'message' => 'Perfil actualizado correctamente',
            'usuario' => [
                'id_usuario' => (int) $usuario['id_usuario'],
                'nombre_completo' => $usuario['nombre_completo'],
                'email' => $usuario['email'],
                'es_admin' => (int) $usuario['es_admin'],
                'avatar' => $usuario['avatar'],
                'fecha_registro' => $usuario['fecha_registro']
            ]
        ];
    }

    public function cambiarPassword(?array $datos = null): array
    {
        if (!isset($_SESSION['id_usuario'])) {
            http_response_code(401);
            return [
                'success' => false,
                'message' => 'Debe iniciar sesión'
            ];
        }

        $datos = $datos ?? $_POST;
        $passwordActual = trim($datos['password_actual'] ?? '');
        $passwordNueva = trim($datos['password_nueva'] ?? '');
        $confirmPasswordNueva = trim($datos['confirm_password_nueva'] ?? '');

        if ($passwordActual === '' || $passwordNueva === '' || $confirmPasswordNueva === '') {
            http_response_code(400);
            return [
                'success' => false,
                'message' => 'Completá todos los campos de contraseña.'
            ];
        }

        $usuario = $this->usuario->buscarCredencialesPorId((int) $_SESSION['id_usuario']);

        if ($usuario === null) {
            http_response_code(401);
            return [
                'success' => false,
                'message' => 'No hay una sesión activa'
            ];
        }

        if (!password_verify($passwordActual, $usuario['password_hash'])) {
            http_response_code(400);
            return [
                'success' => false,
                'message' => 'La contraseña actual es incorrecta.'
            ];
        }

        if (!$this->passwordEsSegura($passwordNueva)) {
            http_response_code(400);
            return [
                'success' => false,
                'message' => 'La nueva contraseña no cumple los requisitos de seguridad.'
            ];
        }

        if ($passwordNueva !== $confirmPasswordNueva) {
            http_response_code(400);
            return [
                'success' => false,
                'message' => 'Las contraseñas nuevas no coinciden.'
            ];
        }

        if (password_verify($passwordNueva, $usuario['password_hash'])) {
            http_response_code(400);
            return [
                'success' => false,
                'message' => 'La nueva contraseña debe ser distinta a la actual.'
            ];
        }

        $actualizada = $this->usuario->actualizarPassword(
            (int) $_SESSION['id_usuario'],
            password_hash($passwordNueva, PASSWORD_DEFAULT)
        );

        if (!$actualizada) {
            http_response_code(500);
            return [
                'success' => false,
                'message' => 'No se pudo actualizar la contraseña.'
            ];
        }

        return [
            'success' => true,
            'message' => 'Contraseña actualizada correctamente'
        ];
    }

    public function logout(): array
    {
        if (!isset($_SESSION['id_usuario'])) {
            return [
                'success' => false,
                'message' => 'No hay una sesión activa'
            ];
        }

        $_SESSION = [];
        session_destroy();

        return [
            'success' => true,
            'message' => 'Sesión cerrada correctamente'
        ];
    }

    private function passwordEsSegura(string $password): bool
    {
        return strlen($password) >= 8
            && preg_match('/[A-Z]/', $password)
            && preg_match('/[0-9]/', $password)
            && preg_match('/[^A-Za-z0-9]/', $password);
    }

    private function normalizarNombreCompleto(string $nombreCompleto): string
    {
        return preg_replace('/\s+/u', ' ', trim($nombreCompleto)) ?? '';
    }

    private function nombreCompletoEsValido(string $nombreCompleto): bool
    {
        if (!preg_match("/^[\p{L}\s'-]+$/u", $nombreCompleto)) {
            return false;
        }

        $partes = preg_split('/\s+/u', $nombreCompleto, -1, PREG_SPLIT_NO_EMPTY);

        if ($partes === false || count($partes) < 2) {
            return false;
        }

        foreach ($partes as $parte) {
            preg_match_all('/\p{L}/u', $parte, $letras);

            if (count($letras[0]) < 2) {
                return false;
            }
        }

        return true;
    }

    public static function procesarAvatar(array $avatar): array
    {
        if (($avatar['error'] ?? UPLOAD_ERR_OK) !== UPLOAD_ERR_OK) {
            return self::error('No se pudo guardar la imagen.');
        }

        if (($avatar['size'] ?? 0) > 2 * 1024 * 1024) {
            return self::error('La imagen supera el tamaño máximo permitido.');
        }

        $finfo = new finfo(FILEINFO_MIME_TYPE);
        $mime = $finfo->file($avatar['tmp_name']);
        $tiposPermitidos = [
            'image/jpeg' => 'jpg',
            'image/png' => 'png',
            'image/webp' => 'webp'
        ];

        if (!array_key_exists($mime, $tiposPermitidos)) {
            return self::error('El formato de imagen no es válido.');
        }

        $directorio = __DIR__ . '/../uploads/avatars/';
        $nombreArchivo = 'avatar_' . bin2hex(random_bytes(8)) . '.' . $tiposPermitidos[$mime];
        $rutaAbsoluta = $directorio . $nombreArchivo;
        $rutaRelativa = 'uploads/avatars/' . $nombreArchivo;

        if (!move_uploaded_file($avatar['tmp_name'], $rutaAbsoluta)) {
            return self::error('No se pudo guardar la imagen.');
        }

        return [
            'success' => true,
            'ruta' => $rutaRelativa,
            'ruta_absoluta' => $rutaAbsoluta
        ];
    }

    public static function hayArchivoNuevo(?array $archivo): bool
    {
        return $archivo !== null && ($archivo['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_NO_FILE;
    }

    private static function error(string $mensaje): array
    {
        return [
            'success' => false,
            'message' => $mensaje
        ];
    }
}
