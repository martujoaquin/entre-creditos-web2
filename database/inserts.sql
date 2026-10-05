-- =========================================================
-- ENTRE CRÉDITOS — DATOS DEMO
-- Ejecutar después del script principal, que ya crea géneros y admin.
-- =========================================================

USE entre_creditos;

START TRANSACTION;

-- =========================================================
-- USUARIOS
-- Contraseñas:
-- Clara123! / Mateo123! / Julia123! / Lucas123! / Sofia123!
-- =========================================================

INSERT INTO usuarios (
    nombre_completo,
    email,
    password_hash,
    es_admin,
    avatar,
    activo
) VALUES
    ('Clara Ibarra', 'clara@entrecreditos.com', '$2y$12$BBGLBUKUCqNwVPkM/Cwr1uMh7cmYuKVMoVOQWuDauKKfhp37gWgzi', 0, 'uploads/avatars/clara.jpg', 1),
    ('Mateo Ruiz', 'mateo@entrecreditos.com', '$2y$12$EWS8JJTusxR6gMm7.O2zIuoW/euR0nY8DX3RW1M6waHwPQm2IC8hu', 0, 'uploads/avatars/mateo.jpg', 1),
    ('Julia Montes', 'julia@entrecreditos.com', '$2y$12$NDXe4df.1vCUwQvccwgDfumFaiyHP92wgDolokP9bMBxeJpJTnjwm', 0, 'uploads/avatars/julia.jpg', 1),
    ('Lucas Ferrero', 'lucas@entrecreditos.com', '$2y$12$pI3dmZnA/Ef7Hc182ylykuxnawkuf37gyzuN12iqPVQDB90ghBPia', 0, 'uploads/avatars/lucas.jpg', 1);

INSERT INTO usuarios
(nombre_completo,email,password_hash,es_admin,activo)
VALUES
('Sofía Benítez', 'sofia@entrecreditos.com', '$2y$12$vp1aQuLICaSlOGbw0ZelBeWSS/K.M.SIekQgPPVWeDv0FR.VX4a0y', 0, 1);
    

-- =========================================================
-- PELÍCULAS
-- Las imágenes deben existir en backend/uploads/peliculas/
-- =========================================================

INSERT INTO peliculas (
    titulo,
    director,
    anio,
    sinopsis,
    imagen,
    id_genero,
    activo
) VALUES
    (
        'Interstellar',
        'Christopher Nolan',
        2014,
        'En un futuro marcado por una crisis ambiental, un grupo de astronautas atraviesa un agujero de gusano en busca de un nuevo hogar para la humanidad.',
        'uploads/peliculas/interstellar.jpg',
        (SELECT id_genero FROM generos WHERE nombre = 'Ciencia ficción'),
        1
    ),
    (
        'Aftersun',
        'Charlotte Wells',
        2022,
        'Años después de unas vacaciones junto a su padre, Sophie reconstruye aquellos recuerdos y descubre todo lo que entonces no podía comprender.',
        'uploads/peliculas/aftersun.jpg',
        (SELECT id_genero FROM generos WHERE nombre = 'Drama'),
        1
    ),
    (
        'Perfect Days',
        'Wim Wenders',
        2023,
        'Un hombre lleva una vida sencilla y metódica en Tokio, encontrando belleza en la música, los libros y los pequeños gestos cotidianos.',
        'uploads/peliculas/perfect-days.jpg',
        (SELECT id_genero FROM generos WHERE nombre = 'Drama'),
        1
    ),
    (
        'Drive',
        'Nicolas Winding Refn',
        2011,
        'Un conductor reservado que trabaja como doble de riesgo y chofer para delincuentes queda atrapado en un conflicto que amenaza a quienes intenta proteger.',
        'uploads/peliculas/drive.jpg',
        (SELECT id_genero FROM generos WHERE nombre = 'Acción'),
        1
    ),
    (
        'Her',
        'Spike Jonze',
        2013,
        'Un hombre solitario desarrolla una relación íntima con un sistema operativo diseñado para adaptarse y evolucionar junto a él.',
        'uploads/peliculas/her.jpg',
        (SELECT id_genero FROM generos WHERE nombre = 'Drama'),
        1
    ),
    (
        'Parasite',
        'Bong Joon-ho',
        2019,
        'Una familia con dificultades económicas comienza a trabajar para un hogar adinerado y pone en marcha un plan que pronto escapa de su control.',
        'uploads/peliculas/parasite.jpg',
        (SELECT id_genero FROM generos WHERE nombre = 'Thriller'),
        1
    ),
    (
        'Whiplash',
        'Damien Chazelle',
        2014,
        'Un joven baterista ingresa a una prestigiosa escuela de música y queda bajo la exigencia extrema de un profesor obsesionado con la excelencia.',
        'uploads/peliculas/whiplash.jpg',
        (SELECT id_genero FROM generos WHERE nombre = 'Drama'),
        1
    ),
    (
        'La La Land',
        'Damien Chazelle',
        2016,
        'Una actriz y un pianista de jazz se enamoran mientras intentan abrirse camino en Los Ángeles sin renunciar a sus propios sueños.',
        'uploads/peliculas/la-la-land.jpg',
        (SELECT id_genero FROM generos WHERE nombre = 'Drama'),
        1
    ),
    (
        'El secreto de sus ojos',
        'Juan José Campanella',
        2009,
        'Un empleado judicial jubilado decide escribir sobre un crimen sin resolver y revive una historia atravesada por la memoria, la justicia y el amor.',
        'uploads/peliculas/el-secreto-de-sus-ojos.jpg',
        (SELECT id_genero FROM generos WHERE nombre = 'Crimen'),
        1
    ),
    (
        'Blade Runner 2049',
        'Denis Villeneuve',
        2017,
        'Un nuevo blade runner descubre un secreto enterrado durante décadas que puede alterar el frágil equilibrio entre humanos y replicantes.',
        'uploads/peliculas/blade-runner-2049.jpg',
        (SELECT id_genero FROM generos WHERE nombre = 'Ciencia ficción'),
        1
    );

-- =========================================================
-- RESEÑAS
-- Una reseña por usuario y película.
-- =========================================================

INSERT INTO resenas (
    id_usuario,
    id_pelicula,
    frase_destacada,
    contenido,
    puntuacion,
    fecha_creacion
) VALUES
    (
        (SELECT id_usuario FROM usuarios WHERE email = 'clara@entrecreditos.com'),
        (SELECT id_pelicula FROM peliculas WHERE titulo = 'Interstellar' AND anio = 2014),
        'El universo es enorme, pero la película siempre vuelve a lo más íntimo.',
        'Interstellar funciona mejor cuando deja de explicar el espacio y se concentra en la distancia entre un padre y una hija. La escala visual es inmensa, pero el verdadero peso está en el tiempo perdido y en todo lo que ya no puede recuperarse. Puede ser enfática, incluso excesiva, pero esa emoción desbordada también forma parte de su identidad.',
        5,
        '2026-07-21 20:30:00'
    ),
    (
        (SELECT id_usuario FROM usuarios WHERE email = 'mateo@entrecreditos.com'),
        (SELECT id_pelicula FROM peliculas WHERE titulo = 'Interstellar' AND anio = 2014),
        'Una aventura espacial sostenida por una emoción muy terrestre.',
        'La película combina espectáculo, ciencia ficción y melodrama sin pedir disculpas. Algunas explicaciones podrían ser más sutiles, pero la construcción del viaje y el uso del tiempo consiguen que cada regreso tenga consecuencias emocionales concretas. La música termina de darle una dimensión casi religiosa.',
        4,
        '2026-07-18 18:15:00'
    ),
    (
        (SELECT id_usuario FROM usuarios WHERE email = 'sofia@entrecreditos.com'),
        (SELECT id_pelicula FROM peliculas WHERE titulo = 'Interstellar' AND anio = 2014),
        'Hay despedidas que duran apenas minutos y otras que atraviesan décadas.',
        'Lo que más me conmueve no es el viaje, sino la forma en que la película convierte el paso del tiempo en una herida visible. Cada decisión tiene un costo y cada reencuentro llega demasiado tarde. Es grandiosa, sentimental y profundamente humana.',
        5,
        '2026-07-16 22:10:00'
    ),
    (
        (SELECT id_usuario FROM usuarios WHERE email = 'julia@entrecreditos.com'),
        (SELECT id_pelicula FROM peliculas WHERE titulo = 'Aftersun' AND anio = 2022),
        'Recordar también es inventar una forma de volver.',
        'Aftersun observa el pasado con la sensibilidad de quien sabe que nunca podrá reconstruirlo por completo. La película trabaja con gestos mínimos, silencios y fragmentos que adquieren otro significado cuando se los mira desde la adultez. No busca explicar al padre: deja que la memoria conviva con aquello que quedó fuera de cuadro.',
        5,
        '2026-07-22 10:05:00'
    ),
    (
        (SELECT id_usuario FROM usuarios WHERE email = 'lucas@entrecreditos.com'),
        (SELECT id_pelicula FROM peliculas WHERE titulo = 'Aftersun' AND anio = 2022),
        'Una película tranquila que termina haciendo mucho ruido por dentro.',
        'Durante buena parte del relato parece que casi nada ocurre, pero cada escena va acumulando una tensión difícil de nombrar. Cuando finalmente entendemos qué estaba intentando conservar Sophie, las imágenes domésticas se vuelven dolorosas. Es una película que crece después de verla.',
        4,
        '2026-07-19 21:40:00'
    ),
    (
        (SELECT id_usuario FROM usuarios WHERE email = 'clara@entrecreditos.com'),
        (SELECT id_pelicula FROM peliculas WHERE titulo = 'Perfect Days' AND anio = 2023),
        'La rutina no siempre es encierro; a veces también puede ser refugio.',
        'Perfect Days encuentra profundidad en acciones que normalmente pasarían desapercibidas. La repetición nunca se siente vacía porque cada jornada introduce una pequeña variación y revela algo nuevo del protagonista. Su serenidad no niega la tristeza: aprende a convivir con ella.',
        5,
        '2026-07-20 12:20:00'
    ),
    (
        (SELECT id_usuario FROM usuarios WHERE email = 'sofia@entrecreditos.com'),
        (SELECT id_pelicula FROM peliculas WHERE titulo = 'Perfect Days' AND anio = 2023),
        'Mirar con atención puede transformar un día común.',
        'La película propone una forma distinta de medir una vida. No por grandes acontecimientos, sino por canciones, árboles, encuentros breves y tareas realizadas con cuidado. Es sencilla sin ser ingenua y emotiva sin forzar una conclusión.',
        4,
        '2026-07-14 17:30:00'
    ),
    (
        (SELECT id_usuario FROM usuarios WHERE email = 'mateo@entrecreditos.com'),
        (SELECT id_pelicula FROM peliculas WHERE titulo = 'Drive' AND anio = 2011),
        'El silencio del protagonista pesa más que cualquier persecución.',
        'Drive construye un personaje casi mítico a partir de miradas, pausas y movimientos precisos. La violencia irrumpe con una intensidad que rompe por completo la calma anterior. Su estilo es muy marcado, pero no funciona solo como superficie: también expresa la imposibilidad del protagonista de pertenecer a una vida normal.',
        4,
        '2026-07-17 23:05:00'
    ),
    (
        (SELECT id_usuario FROM usuarios WHERE email = 'lucas@entrecreditos.com'),
        (SELECT id_pelicula FROM peliculas WHERE titulo = 'Drive' AND anio = 2011),
        'Una historia romántica escondida dentro de una película criminal.',
        'Debajo de los autos, el neón y la violencia hay un personaje que imagina por un momento que podría ser otra persona. La dirección mantiene todo bajo control hasta que esa fantasía se vuelve imposible. La banda sonora y la fotografía hacen que cada escena tenga una identidad inmediata.',
        5,
        '2026-07-13 20:55:00'
    ),
    (
        (SELECT id_usuario FROM usuarios WHERE email = 'sofia@entrecreditos.com'),
        (SELECT id_pelicula FROM peliculas WHERE titulo = 'Her' AND anio = 2013),
        'La tecnología cambia, pero la necesidad de ser comprendidos sigue siendo la misma.',
        'Her no trata tanto sobre enamorarse de una inteligencia artificial como sobre la dificultad de compartir una vida interior con otra persona. La relación parece extraña al principio y rápidamente se vuelve reconocible. Su futuro es cercano, cálido y melancólico.',
        5,
        '2026-07-21 09:45:00'
    ),
    (
        (SELECT id_usuario FROM usuarios WHERE email = 'julia@entrecreditos.com'),
        (SELECT id_pelicula FROM peliculas WHERE titulo = 'Her' AND anio = 2013),
        'A veces una relación termina porque uno de los dos creció hacia un lugar imposible de compartir.',
        'La película evita convertir su premisa en una simple advertencia tecnológica. Lo importante es cómo Theodore aprende a mirar sus vínculos y a reconocer su propia distancia emocional. El diseño visual acompaña esa intimidad con una ciudad suave, casi sin bordes.',
        4,
        '2026-07-15 19:25:00'
    ),
    (
        (SELECT id_usuario FROM usuarios WHERE email = 'lucas@entrecreditos.com'),
        (SELECT id_pelicula FROM peliculas WHERE titulo = 'Parasite' AND anio = 2019),
        'La casa ordena los espacios, pero también decide quién puede ocuparlos.',
        'Parasite cambia de tono con una precisión extraordinaria. Puede ser comedia, thriller y tragedia sin perder coherencia porque todos esos registros nacen del mismo conflicto social. Cada escalera, ventana y desnivel cuenta algo sobre la posición de los personajes.',
        5,
        '2026-07-20 22:00:00'
    ),
    (
        (SELECT id_usuario FROM usuarios WHERE email = 'mateo@entrecreditos.com'),
        (SELECT id_pelicula FROM peliculas WHERE titulo = 'Parasite' AND anio = 2019),
        'Nadie sale limpio de una estructura diseñada para separar.',
        'La película es muy entretenida, pero nunca permite olvidar la desigualdad que impulsa cada decisión. No necesita presentar héroes ni villanos puros: muestra personas tratando de sobrevivir dentro de un sistema que las enfrenta. El cambio de género de la segunda mitad es impecable.',
        5,
        '2026-07-12 16:40:00'
    ),
    (
        (SELECT id_usuario FROM usuarios WHERE email = 'julia@entrecreditos.com'),
        (SELECT id_pelicula FROM peliculas WHERE titulo = 'Whiplash' AND anio = 2014),
        'La excelencia puede sonar igual que una victoria y sentirse como una derrota.',
        'Whiplash convierte un ensayo musical en un combate. La energía es extraordinaria y el montaje hace que cada golpe de batería parezca decisivo. Lo más interesante es que la película nunca ofrece una respuesta cómoda sobre el precio del talento.',
        5,
        '2026-07-18 11:50:00'
    ),
    (
        (SELECT id_usuario FROM usuarios WHERE email = 'clara@entrecreditos.com'),
        (SELECT id_pelicula FROM peliculas WHERE titulo = 'Whiplash' AND anio = 2014),
        'No toda exigencia construye; algunas formas de presión solo dejan cicatrices.',
        'La película es atrapante porque entiende la obsesión de Andrew sin justificar por completo el método de Fletcher. El final puede leerse como una consagración, pero también como el momento exacto en que el protagonista queda atrapado en aquello que perseguía.',
        4,
        '2026-07-11 21:15:00'
    ),
    (
        (SELECT id_usuario FROM usuarios WHERE email = 'clara@entrecreditos.com'),
        (SELECT id_pelicula FROM peliculas WHERE titulo = 'La La Land' AND anio = 2016),
        'Algunas historias no fracasan: simplemente no terminan de la forma que imaginábamos.',
        'La La Land utiliza el musical para hablar de sueños que exigen renuncias concretas. Su final resignifica toda la película sin negar lo vivido por los personajes. La fantasía muestra la vida posible; la mirada final acepta la vida elegida.',
        4,
        '2026-07-22 13:20:00'
    ),
    (
        (SELECT id_usuario FROM usuarios WHERE email = 'sofia@entrecreditos.com'),
        (SELECT id_pelicula FROM peliculas WHERE titulo = 'La La Land' AND anio = 2016),
        'El amor puede ser verdadero incluso cuando no alcanza para sostener el mismo futuro.',
        'La película es luminosa y melancólica al mismo tiempo. Las canciones expresan lo que los personajes todavía no pueden decir y el epílogo convierte una despedida en un homenaje a todo lo que compartieron. Visualmente es bellísima, pero nunca queda vacía.',
        5,
        '2026-07-10 18:00:00'
    ),
    (
        (SELECT id_usuario FROM usuarios WHERE email = 'mateo@entrecreditos.com'),
        (SELECT id_pelicula FROM peliculas WHERE titulo = 'El secreto de sus ojos' AND anio = 2009),
        'Hay preguntas que sobreviven porque nadie se anima a mirar de frente la respuesta.',
        'La película combina el policial con una historia de amor atravesada por el tiempo y la cobardía. Sus personajes viven pendientes de aquello que no dijeron. El desenlace es potente porque resuelve el crimen y, al mismo tiempo, obliga al protagonista a decidir qué hará con su propia vida.',
        5,
        '2026-07-19 14:10:00'
    ),
    (
        (SELECT id_usuario FROM usuarios WHERE email = 'julia@entrecreditos.com'),
        (SELECT id_pelicula FROM peliculas WHERE titulo = 'El secreto de sus ojos' AND anio = 2009),
        'La memoria insiste cuando la justicia decide mirar hacia otro lado.',
        'Más que reconstruir un caso, la película explora todo lo que permanece detenido durante años. La investigación, el amor y la culpa avanzan juntos. Tiene momentos muy calculados, pero el vínculo entre los personajes conserva una emoción genuina.',
        4,
        '2026-07-09 20:35:00'
    ),
    (
        (SELECT id_usuario FROM usuarios WHERE email = 'lucas@entrecreditos.com'),
        (SELECT id_pelicula FROM peliculas WHERE titulo = 'Blade Runner 2049' AND anio = 2017),
        'Ser especial importa menos que elegir qué hacer cuando descubrís que no lo sos.',
        'Blade Runner 2049 amplía el mundo original sin limitarse a repetirlo. La película es lenta, contemplativa y visualmente monumental, pero su conflicto central es muy íntimo: un personaje que necesita creer que su vida tiene un significado único. Su decisión final encuentra valor fuera de esa fantasía.',
        5,
        '2026-07-21 16:50:00'
    ),
    (
        (SELECT id_usuario FROM usuarios WHERE email = 'mateo@entrecreditos.com'),
        (SELECT id_pelicula FROM peliculas WHERE titulo = 'Blade Runner 2049' AND anio = 2017),
        'Un mundo gigantesco contado desde la soledad de alguien que apenas ocupa un lugar en él.',
        'La fotografía y el diseño son impresionantes, pero la película funciona porque todo ese espacio refuerza el aislamiento de K. No busca respuestas rápidas y se toma el tiempo necesario para construir una identidad frágil. Es exigente, pero recompensa la paciencia.',
        4,
        '2026-07-08 22:45:00'
    );

-- =========================================================
-- RESEÑAS COMPARTIDAS
-- Cualquier miembro puede compartir una reseña visible, aunque no sea su autor.
-- =========================================================

INSERT INTO resenas_compartidas (
    id_resena,
    id_usuario_remitente,
    id_usuario_destino,
    fecha_compartida
) VALUES
    (
        (SELECT r.id_resena FROM resenas r JOIN usuarios u ON u.id_usuario = r.id_usuario JOIN peliculas p ON p.id_pelicula = r.id_pelicula WHERE u.email = 'julia@entrecreditos.com' AND p.titulo = 'Aftersun' AND p.anio = 2022),
        (SELECT id_usuario FROM usuarios WHERE email = 'clara@entrecreditos.com'),
        (SELECT id_usuario FROM usuarios WHERE email = 'mateo@entrecreditos.com'),
        '2026-07-22 11:00:00'
    ),
    (
        (SELECT r.id_resena FROM resenas r JOIN usuarios u ON u.id_usuario = r.id_usuario JOIN peliculas p ON p.id_pelicula = r.id_pelicula WHERE u.email = 'lucas@entrecreditos.com' AND p.titulo = 'Blade Runner 2049' AND p.anio = 2017),
        (SELECT id_usuario FROM usuarios WHERE email = 'clara@entrecreditos.com'),
        (SELECT id_usuario FROM usuarios WHERE email = 'sofia@entrecreditos.com'),
        '2026-07-21 18:00:00'
    ),
    (
        (SELECT r.id_resena FROM resenas r JOIN usuarios u ON u.id_usuario = r.id_usuario JOIN peliculas p ON p.id_pelicula = r.id_pelicula WHERE u.email = 'lucas@entrecreditos.com' AND p.titulo = 'Parasite' AND p.anio = 2019),
        (SELECT id_usuario FROM usuarios WHERE email = 'mateo@entrecreditos.com'),
        (SELECT id_usuario FROM usuarios WHERE email = 'lucas@entrecreditos.com'),
        '2026-07-20 22:30:00'
    ),
    (
        (SELECT r.id_resena FROM resenas r JOIN usuarios u ON u.id_usuario = r.id_usuario JOIN peliculas p ON p.id_pelicula = r.id_pelicula WHERE u.email = 'sofia@entrecreditos.com' AND p.titulo = 'Her' AND p.anio = 2013),
        (SELECT id_usuario FROM usuarios WHERE email = 'julia@entrecreditos.com'),
        (SELECT id_usuario FROM usuarios WHERE email = 'clara@entrecreditos.com'),
        '2026-07-21 10:15:00'
    ),
    (
        (SELECT r.id_resena FROM resenas r JOIN usuarios u ON u.id_usuario = r.id_usuario JOIN peliculas p ON p.id_pelicula = r.id_pelicula WHERE u.email = 'mateo@entrecreditos.com' AND p.titulo = 'El secreto de sus ojos' AND p.anio = 2009),
        (SELECT id_usuario FROM usuarios WHERE email = 'lucas@entrecreditos.com'),
        (SELECT id_usuario FROM usuarios WHERE email = 'sofia@entrecreditos.com'),
        '2026-07-19 15:00:00'
    ),
    (
        (SELECT r.id_resena FROM resenas r JOIN usuarios u ON u.id_usuario = r.id_usuario JOIN peliculas p ON p.id_pelicula = r.id_pelicula WHERE u.email = 'clara@entrecreditos.com' AND p.titulo = 'Perfect Days' AND p.anio = 2023),
        (SELECT id_usuario FROM usuarios WHERE email = 'sofia@entrecreditos.com'),
        (SELECT id_usuario FROM usuarios WHERE email = 'mateo@entrecreditos.com'),
        '2026-07-20 13:10:00'
    ),
    (
        (SELECT r.id_resena FROM resenas r JOIN usuarios u ON u.id_usuario = r.id_usuario JOIN peliculas p ON p.id_pelicula = r.id_pelicula WHERE u.email = 'julia@entrecreditos.com' AND p.titulo = 'Whiplash' AND p.anio = 2014),
        (SELECT id_usuario FROM usuarios WHERE email = 'admin@entrecreditos.com'),
        (SELECT id_usuario FROM usuarios WHERE email = 'clara@entrecreditos.com'),
        '2026-07-18 13:00:00'
    ),
    (
        (SELECT r.id_resena FROM resenas r JOIN usuarios u ON u.id_usuario = r.id_usuario JOIN peliculas p ON p.id_pelicula = r.id_pelicula WHERE u.email = 'clara@entrecreditos.com' AND p.titulo = 'La La Land' AND p.anio = 2016),
        (SELECT id_usuario FROM usuarios WHERE email = 'admin@entrecreditos.com'),
        (SELECT id_usuario FROM usuarios WHERE email = 'lucas@entrecreditos.com'),
        '2026-07-22 14:00:00'
    ),
    (
        (SELECT r.id_resena FROM resenas r JOIN usuarios u ON u.id_usuario = r.id_usuario JOIN peliculas p ON p.id_pelicula = r.id_pelicula WHERE u.email = 'clara@entrecreditos.com' AND p.titulo = 'Interstellar' AND p.anio = 2014),
        (SELECT id_usuario FROM usuarios WHERE email = 'sofia@entrecreditos.com'),
        (SELECT id_usuario FROM usuarios WHERE email = 'julia@entrecreditos.com'),
        '2026-07-21 21:00:00'
    ),
    (
        (SELECT r.id_resena FROM resenas r JOIN usuarios u ON u.id_usuario = r.id_usuario JOIN peliculas p ON p.id_pelicula = r.id_pelicula WHERE u.email = 'lucas@entrecreditos.com' AND p.titulo = 'Drive' AND p.anio = 2011),
        (SELECT id_usuario FROM usuarios WHERE email = 'mateo@entrecreditos.com'),
        (SELECT id_usuario FROM usuarios WHERE email = 'julia@entrecreditos.com'),
        '2026-07-17 21:30:00'
    );

COMMIT;
