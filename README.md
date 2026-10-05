# Entre Creditos

## Caratula

- Autor/a: Joaquin Martina
- Materia: Programacion Web 1
- Carrera: Tecnicatura en Programacion de Sistemas - UCES
- Trabajo: Examen final
- Fecha de presentacion: 22/07/2026

## Descripcion del sistema

**Entre Creditos** es un sitio web para un club de cine donde los usuarios registrados pueden consultar peliculas, publicar reseñas, editar sus propias publicaciones y compartirlas con otros miembros registrados.

El sistema esta dividido en tres grandes areas:

- **Area publica:** presenta el sitio, muestra una introduccion a la propuesta y permite acceder al registro o inicio de sesion.
- **Area privada:** permite a los usuarios autenticados navegar peliculas, crear reseñas, ver sus propias reseñas, compartirlas con otros usuarios y consultar las reseñas que otros miembros les compartieron.
- **Area administrativa:** permite a un usuario administrador gestionar usuarios, peliculas, generos y reseñas publicadas.

La tematica elegida es cinematografica. El objetivo del sistema es simular una comunidad privada donde las publicaciones principales son reseñas de peliculas.

## Funcionalidades principales

### Usuarios

- Registro de nuevos usuarios.
- Inicio y cierre de sesion.
- Validacion de email y contraseñas.
- Perfil de usuario con avatar.
- Cambio de contraseñas.
- Bloqueo de acceso para usuarios inactivos.

### Peliculas

- Catalogo de peliculas para usuarios autenticados.
- Detalle de cada pelicula.
- Imagen, titulo, director, año, genero y sinopsis.
- Alta y edicion de peliculas desde el panel administrativo.
- Activacion e inactivacion de peliculas.

### Reseñas

- Creacion de reseñas por parte de usuarios registrados.
- Edicion y eliminacion de reseñas propias.
- Puntuacion entre 1 y 5.
- Frase destacada opcional.
- Una reseña por usuario para cada pelicula.
- Visualizacion de ultimas reseñas en la pagina publica.
- Administracion de reseñas desde el panel interno.

### Compartir contenido

- Los usuarios pueden compartir reseñas con uno o mas usuarios registrados.
- El sistema permite buscar usuarios disponibles para compartir.
- Cada usuario cuenta con una seccion de reseñas compartidas con él.
- No se permite compartir una reseña con uno mismo.
- Se evita duplicar la misma reseña compartida con el mismo destinatario.

### Administracion

El panel administrativo permite:

- Consultar un resumen general del sistema.
- Gestionar usuarios.
- Modificar roles de administrador.
- Activar o inactivar usuarios.
- Gestionar peliculas.
- Gestionar generos.
- Ver y administrar reseñas.

## Tecnologias utilizadas

### Frontend

- Angular 20
- TypeScript
- HTML
- CSS
- RxJS

### Backend

- PHP
- PDO
- MySQL / MariaDB
- Sesiones PHP

### Entorno de desarrollo

- XAMPP
- Node.js
- Angular CLI

## Bibliotecas y recursos de terceros

El frontend fue desarrollado con Angular y sus dependencias oficiales, instaladas mediante `npm`.

Las dependencias principales se encuentran documentadas en:

```text
frontend/package.json
```

Entre ellas:

- `@angular/core`
- `@angular/common`
- `@angular/forms`
- `@angular/router`
- `rxjs`
- `typescript`

Las imagenes y recursos visuales propios del sitio se encuentran en:

```text
frontend/public/images/
backend/uploads/
```

## Estructura del proyecto

```text
entre-creditos/
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── uploads/
│   └── index.php
│
├── database/
│   ├── entre_creditos.sql
│   └── modelo_base_datos.xlsx
│
├── frontend/
│   ├── public/
│   ├── src/
│   ├── angular.json
│   ├── package.json
│   └── package-lock.json
│
├── recursos/
├── storage/
└── README.md
```

## Base de datos

La base de datos principal se llama:

```text
entre_creditos
```

El script inicial se encuentra en:

```text
database/entre_creditos.sql
```

Tablas principales:

- `usuarios`
- `generos`
- `peliculas`
- `reseñas`
- `reseñas_compartidas`

El script incluye:

- Creacion de tablas.
- Claves primarias.
- Claves foraneas.
- Restricciones de unicidad.
- Generos iniciales.
- Usuario administrador inicial.

## Credenciales iniciales

El script SQL crea un usuario administrador inicial:

```text
Email: admin@entrecreditos.com
contraseñas: Admin123!
```

Se recomienda cambiar la contraseñas luego de instalar y probar el sistema.

## Uso del sistema

### Usuario comun

1. Ingresar al sitio.
2. Registrarse con nombre completo, email y contraseñas segura.
3. Iniciar sesion.
4. Navegar el catalogo de peliculas.
5. Crear una reseña desde el detalle de una pelicula.
6. Entrar a "Mis reseñas" para editar, eliminar o compartir publicaciones.
7. Seleccionar uno o mas usuarios para compartir una reseña.
8. Consultar la seccion "Compartidas" para ver reseñas recibidas.

### Usuario administrador

1. Iniciar sesion con la cuenta administradora.
2. Acceder al panel de administracion.
3. Gestionar usuarios, peliculas, generos y reseñas.
4. Activar o inactivar usuarios y peliculas segun corresponda.

## Reglas de negocio principales

- Solo los usuarios autenticados pueden acceder al area privada.
- Solo los administradores pueden acceder al panel de administracion.
- Los usuarios inactivos no pueden iniciar sesion.
- Las peliculas inactivas no se muestran en el catalogo general.
- No se pueden crear reseñas para peliculas inactivas.
- Cada usuario puede crear solo una reseña por pelicula.
- El autor puede editar o eliminar su propia reseña.
- El administrador puede administrar las reseñas del sistema.
- Una reseña se puede compartir con varios usuarios registrados.

## Seguridad aplicada

El proyecto contempla medidas basicas de seguridad vistas en la materia:

- contraseñass almacenadas con hash mediante `password_hash`.
- Verificacion de contraseñass con `password_verify`.
- Consultas SQL preparadas con PDO.
- Validacion de email.
- Validacion de campos obligatorios.
- Validacion de IDs numericos.
- Validacion de roles y permisos.
- Middleware de autenticacion.
- Middleware de administrador.
- Validacion de tipo MIME y tamaño en imagenes subidas.
- Separacion entre usuarios comunes y administradores.

## Archivos destacados

```text
backend/index.php
```

Punto de entrada de la API PHP. Define las acciones y recursos principales.

```text
backend/config/database.php
```

Configuracion de conexion a MySQL mediante PDO.

```text
backend/controllers/
```

Controladores encargados de validar solicitudes y coordinar modelos.

```text
backend/models/
```

Modelos con consultas SQL y acceso a datos.

```text
backend/middleware/
```

Verificaciones de autenticacion y permisos.

```text
frontend/src/app/app.routes.ts
```

Rutas principales de Angular y proteccion de accesos.

```text
frontend/src/app/features/
```

Funcionalidades del sistema separadas por area: publica, autenticacion, club y administracion.

## Modelo de datos resumido

- Un usuario puede crear muchas reseñas.
- Una pelicula puede tener muchas reseñas.
- Un genero puede estar asociado a muchas peliculas.
- Una reseña puede compartirse con muchos usuarios.
- La tabla `reseñas_compartidas` relaciona reseñas, remitentes y destinatarios.
