# Features

Las features representan las funcionalidades principales de la aplicación.

Cada carpeta agrupa una parte del sistema según la experiencia del usuario, evitando mezclar la lógica del proyecto.

## Estructura

- **public/** → Todo lo accesible sin iniciar sesión (Landing, Login, Registro).
- **auth/** → Autenticación y gestión de sesión.
- **club/** → Funcionalidades disponibles para los usuarios autenticados.
- **admin/** → Panel de administración y CRUDs.

Esta organización facilita el mantenimiento del proyecto y permite que cada funcionalidad tenga sus propios componentes, páginas, servicios y modelos cuando sea necesario.