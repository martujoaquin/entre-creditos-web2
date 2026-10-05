# Arquitectura

Este documento define la arquitectura general del proyecto **Entre Créditos**.

## Tecnologías

- Angular 20
- TypeScript
- PHP
- MySQL
- Bootstrap
- CSS
- XAMPP

## Arquitectura

```text
App
│
├── Core → Hace funcionar la aplicación.
├── Shared → Elementos reutilizables.
├── Layouts → Estructura de las páginas.
└── Features → Funcionalidades del sistema.
```

## Layouts

- PublicLayout
- ClubLayout
- AdminLayout

## Features

```text
features/
├── public/
├── auth/
├── club/
└── admin/
```

### Public

- Landing
- Login
- Register

### Club

- Home
- Películas
- Mis reseñas
- Compartidas
- Favoritas
- Perfil

### Admin

- Dashboard
- Usuarios
- Películas
- Géneros
- Reseñas

## Convenciones

- Respetar la estructura de carpetas existente.
- No crear archivos innecesarios.
- Utilizar componentes standalone.
- Cada feature contiene únicamente los archivos que realmente necesita.
- Los componentes reutilizables pertenecen a `shared`.
- La infraestructura global pertenece a `core`.

# Identidad visual

## Concepto

Entre Créditos es un club privado para amantes del cine.

La interfaz debe transmitir:

- Elegancia.
- Minimalismo.
- Calma.
- Estilo editorial.
- Ambiente cinematográfico.
- Sensación premium.

Nunca debe sentirse como:

- Netflix.
- Letterboxd.
- IMDb.
- Una red social.
- Una plataforma de streaming.
- Una interfaz gamer.

---

# Tipografías

## Cormorant Garamond

Uso exclusivo para:

- Logotipo "Entre Créditos".
- Hero principal.
- Títulos principales de las secciones.

No utilizar en:

- Botones.
- Navbar (excepto el nombre del proyecto).
- Formularios.
- Cards.
- Texto general.
- Panel de administración.

### Logotipo

- "Entre"
  - Cormorant Garamond
  - Font Style: Normal
  - Font Weight: 500
  - Color: Blanco

- "Créditos"
  - Cormorant Garamond
  - Font Style: Italic
  - Font Weight: 500
  - Color: Azul principal

---

## Inter

Usar para toda la interfaz.

Incluye:

- Navbar.
- Botones.
- Inputs.
- Formularios.
- Cards.
- Etiquetas.
- Links.
- Menús.
- Reseñas.
- Descripciones.
- Perfil.
- Panel de administración.
- Texto general.

---

# Paleta de colores

## Fondo principal

`#050A18`

Color principal de toda la aplicación.

---

## Fondo secundario

`#0B1224`

Utilizar para:

- Hero.
- Secciones.
- Paneles.

---

## Cards

`#1A2238`

Utilizar para:

- Cards de reseñas.
- Cards de películas.
- Cards informativas.
- Paneles.

---

## Color principal

`#4A8DFF`

Utilizar para:

- Botones primarios.
- Links.
- Elementos activos.
- Iconos destacados.
- Detalles del logotipo.

---

## Hover principal

`#6AA6FF`

Utilizar únicamente como hover del color principal.

---

## Texto principal

`#FFFFFF`

---

## Texto secundario

`#B9C2D3`

Para:

- Descripciones.
- Información secundaria.
- Metadata.
- Fechas.

---

## Texto deshabilitado

`#7A8499`

---

## Bordes

`rgba(255,255,255,0.08)`

Utilizar para:

- Inputs.
- Cards.
- Navbar.
- Separadores.
- Botones secundarios.

---

# Botones

## Primario

Fondo:

`#4A8DFF`

Texto:

`#FFFFFF`

Hover:

`#6AA6FF`

Tipografía:

Inter

---

## Secundario

Fondo transparente.

Borde:

`rgba(255,255,255,0.12)`

Texto:

Blanco.

Hover:

`rgba(255,255,255,0.06)`

Tipografía:

Inter

---

# Bordes

Botones:

`999px`

Inputs:

`16px`

Cards:

`20px`

---

# Sombras

- Muy sutiles.
- Sin sombras intensas.
- Priorizar contraste y espacio antes que efectos visuales.

---

# Reglas de diseño

- Mantener siempre la misma paleta.
- No inventar nuevos colores.
- No cambiar las tipografías.
- Mantener mucho espacio entre secciones.
- Utilizar pocos colores.
- Evitar gradientes llamativos.
- Mantener una estética limpia, elegante y cinematográfica.
- Toda nueva pantalla debe sentirse parte del mismo producto.

## Consistencia entre Login y Register

Las pantallas de autenticación forman una única experiencia.

Todo cambio visual realizado en una de ellas debe aplicarse también en la otra, salvo cuando el cambio corresponda exclusivamente al contenido del formulario.

Esto incluye:

- dimensiones
- espaciados
- tipografía
- colores
- botones
- inputs
- bordes
- sombras
- responsive

La única diferencia entre ambas pantallas debe ser el contenido del formulario y los textos específicos.