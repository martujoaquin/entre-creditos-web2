<?php

session_start();

$allowedOrigins = [
    'http://localhost:4200',
    'http://127.0.0.1:4200',
];

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';

if (in_array($origin, $allowedOrigins, true)) {
    header("Access-Control-Allow-Origin: {$origin}");
    header('Access-Control-Allow-Credentials: true');
    header('Access-Control-Allow-Methods: GET, POST, PATCH, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type');
}

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/models/Genero.php';
require_once __DIR__ . '/models/Pelicula.php';
require_once __DIR__ . '/models/Resena.php';
require_once __DIR__ . '/models/ResenaCompartida.php';
require_once __DIR__ . '/models/Usuario.php';
require_once __DIR__ . '/middleware/RequireAuth.php';
require_once __DIR__ . '/middleware/RequireAdmin.php';
require_once __DIR__ . '/controllers/GeneroController.php';
require_once __DIR__ . '/controllers/PeliculaController.php';
require_once __DIR__ . '/controllers/ResenaController.php';
require_once __DIR__ . '/controllers/ResenaCompartidaController.php';
require_once __DIR__ . '/controllers/UsuarioController.php';
require_once __DIR__ . '/controllers/AuthController.php';
require_once __DIR__ . '/controllers/DevelopmentController.php';
require_once __DIR__ . '/controllers/AdminDashboardController.php';

header('Content-Type: application/json; charset=utf-8');

function obtenerDatosRequest(): array
{
    $contenido = file_get_contents('php://input');
    $tipoContenido = $_SERVER['CONTENT_TYPE'] ?? '';

    if (stripos($tipoContenido, 'application/json') !== false && trim($contenido) !== '') {
        $datos = json_decode($contenido, true);

        return is_array($datos) ? $datos : [];
    }

    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        return $_POST;
    }

    $datos = [];
    parse_str($contenido, $datos);

    return $datos;
}

try {

    $action = $_GET['action'] ?? $_POST['action'] ?? null;

    if ($_SERVER['REQUEST_METHOD'] === 'POST' && $action === 'register') {
        $usuario = new Usuario($conexion);
        $authController = new AuthController($usuario);

        echo json_encode($authController->registrar());
        exit;
    }

    if ($_SERVER['REQUEST_METHOD'] === 'POST' && $action === 'login') {
        $usuario = new Usuario($conexion);
        $authController = new AuthController($usuario);

        echo json_encode($authController->login());
        exit;
    }

    if ($_SERVER['REQUEST_METHOD'] === 'POST' && $action === 'logout') {
        $usuario = new Usuario($conexion);
        $authController = new AuthController($usuario);

        echo json_encode($authController->logout());
        exit;
    }

    if ($_SERVER['REQUEST_METHOD'] === 'GET' && $action === 'me') {
        $usuario = new Usuario($conexion);
        $authController = new AuthController($usuario);

        echo json_encode($authController->me());
        exit;
    }

    if (($_GET['resource'] ?? '') === 'perfil') {
        $error = RequireAuth::verificar();

        if ($error !== null) {
            http_response_code(401);
            echo json_encode($error);
            exit;
        }

        $usuario = new Usuario($conexion);
        $authController = new AuthController($usuario);
        $metodo = $_SERVER['REQUEST_METHOD'];

        if ($metodo === 'POST' && ($_POST['_method'] ?? '') === 'PATCH') {
            $metodo = 'PATCH';
        }

        if ($metodo === 'GET') {
            echo json_encode($authController->perfil());
            exit;
        }

        if ($metodo === 'POST' && $action === 'cambiar_password') {
            echo json_encode($authController->cambiarPassword(obtenerDatosRequest()));
            exit;
        }

        if ($metodo === 'PATCH') {
            $datos = $_SERVER['REQUEST_METHOD'] === 'POST'
                ? $_POST
                : obtenerDatosRequest();

            echo json_encode($authController->actualizarPerfil($datos, $_FILES));
            exit;
        }

        http_response_code(405);
        echo json_encode([
            'success' => false,
            'message' => 'Método no permitido'
        ]);
        exit;
    }

    if ($action === 'resetDatabase') {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            echo json_encode([
                'success' => false,
                'message' => 'Método no permitido'
            ]);
            exit;
        }

        $error = RequireAdmin::verificar();

        if ($error !== null) {
            echo json_encode($error);
            exit;
        }

        $developmentController = new DevelopmentController($conexion);

        echo json_encode($developmentController->resetDatabase($_POST));
        exit;
    }

    if (($_GET['resource'] ?? '') === 'admin-dashboard') {
        if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
            http_response_code(405);
            echo json_encode([
                'success' => false,
                'message' => 'Método no permitido'
            ]);
            exit;
        }

        $error = RequireAdmin::verificar();

        if ($error !== null) {
            http_response_code(isset($_SESSION['id_usuario']) ? 403 : 401);
            echo json_encode($error);
            exit;
        }

        $controller = new AdminDashboardController($conexion);

        echo json_encode($controller->resumen());
        exit;
    }

    if (($_GET['resource'] ?? '') === 'generos') {
        $genero = new Genero($conexion);
        $controller = new GeneroController($genero);
        $metodo = $_SERVER['REQUEST_METHOD'];

        if ($metodo === 'GET') {
            $error = RequireAuth::verificar();

            if ($error !== null) {
                echo json_encode($error);
                exit;
            }

            echo json_encode($controller->listar());
            exit;
        }

        if ($metodo === 'POST') {
            $error = RequireAdmin::verificar();

            if ($error !== null) {
                echo json_encode($error);
                exit;
            }

            echo json_encode($controller->crear());
            exit;
        }

        if ($metodo === 'PATCH') {
            $error = RequireAdmin::verificar();

            if ($error !== null) {
                echo json_encode($error);
                exit;
            }

            parse_str(file_get_contents('php://input'), $datos);
            echo json_encode($controller->actualizar($datos));
            exit;
        }

        if ($metodo === 'DELETE') {
            $error = RequireAdmin::verificar();

            if ($error !== null) {
                echo json_encode($error);
                exit;
            }

            parse_str(file_get_contents('php://input'), $datos);
            echo json_encode($controller->eliminar($datos));
            exit;
        }
    }

    if (($_GET['resource'] ?? '') === 'peliculas') {
        $pelicula = new Pelicula($conexion);
        $genero = new Genero($conexion);
        $controller = new PeliculaController($pelicula, $genero);
        $metodo = $_SERVER['REQUEST_METHOD'];

        if ($metodo === 'POST' && ($_POST['_method'] ?? '') === 'PATCH') {
            $metodo = 'PATCH';
        }

        if ($metodo === 'GET') {
            $error = RequireAuth::verificar();

            if ($error !== null) {
                echo json_encode($error);
                exit;
            }

            $incluirInactivas = (int) ($_SESSION['es_admin'] ?? 0) === 1;

            echo json_encode($controller->listar($incluirInactivas));
            exit;
        }

        if ($metodo === 'POST') {
            $error = RequireAdmin::verificar();

            if ($error !== null) {
                echo json_encode($error);
                exit;
            }

            echo json_encode($controller->crear());
            exit;
        }

        if ($metodo === 'PATCH') {
            $error = RequireAdmin::verificar();

            if ($error !== null) {
                echo json_encode($error);
                exit;
            }

            if ($_SERVER['REQUEST_METHOD'] === 'POST') {
                $datos = $_POST;
            } else {
                parse_str(file_get_contents('php://input'), $datos);
            }

            echo json_encode($controller->actualizar($datos, $_FILES));
            exit;
        }
    }

    if (($_GET['resource'] ?? '') === 'usuarios') {
        $error = RequireAdmin::verificar();

        if ($error !== null) {
            http_response_code(isset($_SESSION['id_usuario']) ? 403 : 401);
            echo json_encode($error);
            exit;
        }

        $usuario = new Usuario($conexion);
        $controller = new UsuarioController($usuario);
        $metodo = $_SERVER['REQUEST_METHOD'];

        if ($metodo === 'POST' && ($_POST['_method'] ?? '') === 'PATCH') {
            $metodo = 'PATCH';
        }

        if ($metodo === 'GET') {
            echo json_encode($controller->listar());
            exit;
        }

        if ($metodo === 'PATCH') {
            if ($_SERVER['REQUEST_METHOD'] === 'POST') {
                $datos = $_POST;
            } else {
                parse_str(file_get_contents('php://input'), $datos);
            }

            echo json_encode($controller->actualizar($datos, $_FILES, (int) $_SESSION['id_usuario']));
            exit;
        }

        http_response_code(405);
        echo json_encode([
            'success' => false,
            'message' => 'Método no permitido'
        ]);
        exit;
    }

    if (($_GET['resource'] ?? '') === 'usuarios_compartir') {
        $error = RequireAuth::verificar();

        if ($error !== null) {
            http_response_code(401);
            echo json_encode($error);
            exit;
        }

        if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
            http_response_code(405);
            echo json_encode([
                'success' => false,
                'message' => 'Método no permitido'
            ]);
            exit;
        }

        $resenaCompartida = new ResenaCompartida($conexion);
        $controller = new ResenaCompartidaController($resenaCompartida);

        echo json_encode($controller->listarUsuariosDisponibles((int) $_SESSION['id_usuario']));
        exit;
    }

    if (($_GET['resource'] ?? '') === 'resenas_compartidas') {
        $error = RequireAuth::verificar();

        if ($error !== null) {
            http_response_code(401);
            echo json_encode($error);
            exit;
        }

        $resenaCompartida = new ResenaCompartida($conexion);
        $controller = new ResenaCompartidaController($resenaCompartida);
        $metodo = $_SERVER['REQUEST_METHOD'];
        $idUsuario = (int) $_SESSION['id_usuario'];

        if ($metodo === 'GET') {
            echo json_encode($controller->listarCompartidasConmigo($idUsuario));
            exit;
        }

        if ($metodo === 'POST') {
            echo json_encode($controller->compartir(obtenerDatosRequest(), $idUsuario));
            exit;
        }

        http_response_code(405);
        echo json_encode([
            'success' => false,
            'message' => 'Método no permitido'
        ]);
        exit;
    }

    if (($_GET['resource'] ?? '') === 'resenas') {
        if ($_SERVER['REQUEST_METHOD'] === 'GET' && ($_GET['scope'] ?? '') === 'landing') {
            $resena = new Resena($conexion);
            $pelicula = new Pelicula($conexion);
            $controller = new ResenaController($resena, $pelicula);

            echo json_encode($controller->listarLanding());
            exit;
        }

        if ($_SERVER['REQUEST_METHOD'] === 'GET' && ($_GET['scope'] ?? '') === 'admin') {
            $error = RequireAdmin::verificar();

            if ($error !== null) {
                http_response_code(isset($_SESSION['id_usuario']) ? 403 : 401);
                echo json_encode($error);
                exit;
            }

            $resena = new Resena($conexion);
            $pelicula = new Pelicula($conexion);
            $controller = new ResenaController($resena, $pelicula);

            echo json_encode($controller->listarAdmin());
            exit;
        }

        $error = RequireAuth::verificar();

        if ($error !== null) {
            http_response_code(401);
            echo json_encode($error);
            exit;
        }

        $resena = new Resena($conexion);
        $pelicula = new Pelicula($conexion);
        $controller = new ResenaController($resena, $pelicula);
        $metodo = $_SERVER['REQUEST_METHOD'];
        $idUsuario = (int) $_SESSION['id_usuario'];
        $esAdmin = (int) ($_SESSION['es_admin'] ?? 0) === 1;

        if ($metodo === 'GET') {
            if (isset($_GET['id_resena'])) {
                echo json_encode($controller->obtenerPorId($_GET, $idUsuario, $esAdmin));
                exit;
            }

            echo json_encode($controller->listarPorPelicula($_GET));
            exit;
        }

        if ($metodo === 'POST') {
            echo json_encode($controller->crear(obtenerDatosRequest(), $idUsuario));
            exit;
        }

        if ($metodo === 'PATCH') {
            $datos = array_merge($_GET, obtenerDatosRequest());
            echo json_encode($controller->actualizar($datos, $idUsuario, $esAdmin));
            exit;
        }

        if ($metodo === 'DELETE') {
            $datos = array_merge($_GET, obtenerDatosRequest());
            echo json_encode($controller->eliminar($datos, $idUsuario, $esAdmin));
            exit;
        }

        http_response_code(405);
        echo json_encode([
            'success' => false,
            'message' => 'Método no permitido'
        ]);
        exit;
    }

    $genero = new Genero($conexion);
    $controller = new GeneroController($genero);

    echo json_encode($controller->estadoConexion());

} catch (PDOException $e) {
    http_response_code(500);

    echo json_encode([
        'success' => false,
        'message' => 'Error al consultar la base de datos'
    ]);
} catch (Throwable $e) {
    http_response_code(500);

    echo json_encode([
        'success' => false,
        'message' => 'Error interno del servidor'
    ]);
}
