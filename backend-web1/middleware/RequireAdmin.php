<?php

class RequireAdmin
{
    public static function verificar(): ?array
    {
        $error = RequireAuth::verificar();

        if ($error !== null) {
            return $error;
        }

        if ((int) ($_SESSION['es_admin'] ?? 0) !== 1) {
            return [
                'success' => false,
                'message' => 'No tiene permisos de administrador'
            ];
        }

        return null;
    }
}
