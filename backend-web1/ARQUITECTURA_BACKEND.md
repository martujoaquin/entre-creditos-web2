# Arquitectura del Backend - Entre Créditos

## Objetivo

El backend de **Entre Créditos** está desarrollado en **PHP** y se encarga de:

- Conectarse a la base de datos MySQL.
- Procesar las solicitudes del frontend Angular.
- Aplicar las reglas de negocio.
- Gestionar la autenticación y autorización.
- Devolver respuestas en formato JSON.

Se utiliza una arquitectura simple, organizada por responsabilidades, fácil de explicar y adecuada para el Trabajo Final de Programación Web 1.

---

# Estructura

```
backend/
│
├── config/
├── controllers/
├── middleware/
├── models/
├── routes/
├── uploads/
└── index.php
```

---

# config/

Contiene la configuración general del backend.

Actualmente incluye:

```
database.php
```

Responsabilidad:

- Crear la conexión PDO con MySQL.
- Configurar el charset.
- Configurar el manejo de errores.
- Dejar disponible la variable `$conexion` para el resto del proyecto.

No contiene lógica de negocio.

---

# controllers/

Los controladores reciben las solicitudes provenientes del frontend.

Su responsabilidad es:

- Leer los datos recibidos.
- Validarlos.
- Llamar al modelo correspondiente.
- Construir la respuesta JSON.

Ejemplos futuros:

```
LoginController.php
UsuarioController.php
PeliculaController.php
ResenaController.php
GeneroController.php
```

Los controladores **no realizan consultas SQL directamente**.

---

# models/

Los modelos representan las entidades del sistema y contienen el acceso a la base de datos.

Su responsabilidad es:

- Ejecutar consultas SQL.
- Insertar registros.
- Actualizar información.
- Eliminar registros.
- Obtener datos.

Ejemplos futuros:

```
Usuario.php
Pelicula.php
Genero.php
Resena.php
```

Toda consulta SQL debe concentrarse en esta carpeta.

---

# routes/

Define qué controlador responde a cada endpoint del backend.

Ejemplos:

```
POST /login
POST /register
GET /peliculas
POST /resenas
```

De esta forma las URLs quedan organizadas y desacopladas de la lógica.

---

# middleware/

Contiene verificaciones que deben ejecutarse antes de permitir ciertas acciones.

Ejemplos:

- Verificar si el usuario inició sesión.
- Verificar si el usuario es administrador.
- Validar permisos.

Ejemplo:

```
Un usuario común intenta eliminar una película.

↓

El middleware detecta que no es administrador.

↓

Devuelve un error y no ejecuta el controlador.
```

---

# uploads/

Almacena archivos subidos por los usuarios.

Ejemplos:

- Avatares.
- Imágenes de películas (si en el futuro se permiten).

No almacena código.

---

# index.php

Es el punto de entrada del backend.

Todas las solicitudes pasan primero por este archivo.

Actualmente:

- Incluye la conexión con la base de datos.
- Comprueba que PHP pueda conectarse correctamente a MySQL.

Más adelante también podrá encargarse de redirigir las solicitudes hacia las rutas correspondientes.

---

# Flujo general

```
Angular
      │
      ▼
index.php
      │
      ▼
Routes
      │
      ▼
Controller
      │
      ▼
Model
      │
      ▼
MySQL
      │
      ▼
Respuesta JSON
      │
      ▼
Angular
```

---

# Principios del proyecto

- Arquitectura simple.
- Una responsabilidad por carpeta.
- Consultas SQL únicamente en Models.
- Controladores sin SQL.
- Configuración aislada.
- Respuestas en formato JSON.
- Compatible con PHP nativo y MySQL.
- Fácil de explicar durante el examen.

---

# Estado actual

## Implementado

- Estructura inicial del backend.
- Conexión PDO con MySQL.
- Verificación de conexión mediante `index.php`.

## Pendiente

- Sistema de rutas.
- Login.
- Registro.
- Autenticación.
- CRUD de usuarios.
- CRUD de películas.
- CRUD de géneros.
- CRUD de reseñas.
- Compartir reseñas.
- Panel de administración.