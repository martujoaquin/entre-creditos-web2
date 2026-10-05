<?php

class RequireAuth
{
    public static function verificar(): ?array
    {
        if (!isset($_SESSION['id_usuario'])) {
            return [
                'success' => false,
                'message' => 'Debe iniciar sesión'
            ];
        }

        return null;
    }
}
