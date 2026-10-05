# Core

La carpeta **Core** contiene la infraestructura global de la aplicación.

Todo lo que se encuentre aquí puede ser utilizado por cualquier parte del sistema y normalmente existe una única vez durante toda la ejecución de la aplicación.

## Estructura

- **guards/** → Protegen las rutas verificando permisos o autenticación.
- **interceptors/** → Interceptan las peticiones HTTP para modificar solicitudes o respuestas antes de que lleguen a la aplicación.
- **services/** → Servicios globales compartidos por toda la aplicación.

## ¿Qué NO debería ir en Core?

Las funcionalidades propias del negocio, como películas, reseñas, géneros o perfiles de usuario.

Esas pertenecen a la carpeta **features**, ya que representan módulos funcionales de la aplicación.

## Objetivo

Mantener separada la infraestructura del sistema de la lógica del negocio para lograr un proyecto más organizado, reutilizable y fácil de mantener.