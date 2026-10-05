# Shared

La carpeta **Shared** contiene elementos reutilizables que pueden ser utilizados por distintas partes de la aplicación.

Su objetivo es evitar duplicar código y mantener una interfaz consistente.

## Estructura

- **components/** → Componentes reutilizables (Navbar, Footer, Cards, Modales, etc.).
- **utils/** → Funciones auxiliares reutilizables.

## ¿Qué NO debería ir en Shared?

La lógica propia de una funcionalidad específica.

Si un componente o servicio solo pertenece a una feature (por ejemplo, Reseñas o Películas), debe permanecer dentro de esa feature.

## Objetivo

Centralizar todos los elementos reutilizables de la aplicación para mejorar la organización y facilitar el mantenimiento.