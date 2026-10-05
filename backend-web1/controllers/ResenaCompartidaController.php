<?php

class ResenaCompartidaController
{
    private const MAX_DESTINATARIOS = 20;

    private ResenaCompartida $resenaCompartida;

    public function __construct(ResenaCompartida $resenaCompartida)
    {
        $this->resenaCompartida = $resenaCompartida;
    }

    public function listarUsuariosDisponibles(int $idUsuarioActual): array
    {
        return [
            'success' => true,
            'usuarios' => $this->resenaCompartida->getAvailableUsers($idUsuarioActual)
        ];
    }

    public function compartir(array $datos, int $idUsuarioRemitente): array
    {
        $validacion = $this->validarDatosCompartir($datos, $idUsuarioRemitente);

        if ($validacion['success'] === false) {
            return $validacion;
        }

        try {
            $resultado = $this->resenaCompartida->share(
                $validacion['id_resena'],
                $idUsuarioRemitente,
                $validacion['destinatarios']
            );
        } catch (Throwable $e) {
            http_response_code(500);
            return $this->error('No se pudo compartir la reseña.');
        }

        return [
            'success' => true,
            'message' => empty($resultado['compartidos'])
                ? 'La reseña ya había sido compartida con los destinatarios seleccionados.'
                : 'Reseña compartida correctamente',
            'compartidos' => $resultado['compartidos'],
            'ya_compartidos' => $resultado['ya_compartidos']
        ];
    }

    public function listarCompartidasConmigo(int $idUsuario): array
    {
        return [
            'success' => true,
            'compartidas' => $this->resenaCompartida->getSharedWithUser($idUsuario)
        ];
    }

    private function validarDatosCompartir(array $datos, int $idUsuarioRemitente): array
    {
        $idResena = $datos['id_resena'] ?? null;

        if (!$this->idEsValido($idResena)) {
            http_response_code(400);
            return $this->error('La reseña es obligatoria.');
        }

        $idResena = (int) $idResena;

        if (!$this->resenaCompartida->reviewExistsAndIsVisible($idResena)) {
            http_response_code(404);
            return $this->error('La reseña no está disponible.');
        }

        if (!array_key_exists('destinatarios', $datos) || !is_array($datos['destinatarios'])) {
            http_response_code(400);
            return $this->error('Seleccioná al menos un destinatario.');
        }

        $destinatarios = [];

        foreach ($datos['destinatarios'] as $destinatario) {
            if (!$this->idEsValido($destinatario)) {
                http_response_code(400);
                return $this->error('Los destinatarios seleccionados no son válidos.');
            }

            $destinatarios[] = (int) $destinatario;
        }

        $destinatarios = array_values(array_unique($destinatarios));

        if (empty($destinatarios)) {
            http_response_code(400);
            return $this->error('Seleccioná al menos un destinatario.');
        }

        if (count($destinatarios) > self::MAX_DESTINATARIOS) {
            http_response_code(400);
            return $this->error('No se puede compartir con más de 20 destinatarios por vez.');
        }

        if (in_array($idUsuarioRemitente, $destinatarios, true)) {
            http_response_code(400);
            return $this->error('No podés compartir una reseña con vos mismo.');
        }

        foreach ($destinatarios as $destinatario) {
            if (!$this->resenaCompartida->userExists($destinatario)) {
                http_response_code(404);
                return $this->error('Uno de los destinatarios no está disponible.');
            }
        }

        return [
            'success' => true,
            'id_resena' => $idResena,
            'destinatarios' => $destinatarios
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
