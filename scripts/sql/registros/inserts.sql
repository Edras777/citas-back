-- insertar un servicio
INSERT INTO citas.servicios (
        nombre,
        precio,
        descripcion,
        ubicacion,
        privado,
        duracion
    )
VALUES(
        'Corte de Cabello',
        25,
        'Corte para cabellero y niño',
        'Chiquimulilla',
        0,
        30
    );
    
-- insertar rol
INSERT INTO `citas`.`roles` (`nombre`, `tipo`)
VALUES ('administrador', 'ADMIN'),
    ('colaborador', 'USUARIO');

-- insertar usuario
INSERT INTO `citas`.`usuarios` (
        `nombre`,
        `apellido`,
        `email`,
        `telefono`,
        `direccion`,
        `privado`,
        `id_rol`
    )
VALUES (
        'Mario',
        'Hernandez',
        'mario@gmail.com',
        '45657654',
        'chiquimulilla',
        0,
        1
    );

    -- insertar usuarios_configuraciones
INSERT INTO `citas`.`usuarios_configuraciones` (
        `id_usuario`,
        `usuario`,
        `password`
    )
VALUES (
        1,
        'mario',
        '$2a$10$IMAb33aVjqKVANHyFcCtkOqMNEqYdB3ojpuowdm3IJhMGekDPaG0q'
    );

-- relacionar servicio con usuario
INSERT INTO `citas`.`servicios_usuarios` (`id_usuario`, `id_servicio`) 
    VALUES(1, 1);

-- configuraciones
INSERT INTO `citas`.`configuraciones_globales` (`nombre`, `valor`)
VALUES (
        'horario_laboral',
        '{"lunes":{"inicio":"09:00","fin":"18:00","descanso":[{"inicio":"14:30","fin":"15:00"}]},"martes":{"inicio":"09:00","fin":"18:00","descanso":[{"inicio":"14:30","fin":"15:00"}]},"miercoles":{"inicio":"09:00","fin":"18:00","descanso":[{"inicio":"14:30","fin":"15:00"}]},"jueves":{"inicio":"09:00","fin":"18:00","descanso":[{"inicio":"14:30","fin":"15:00"}]},"viernes":{"inicio":"09:00","fin":"18:00","descanso":[{"inicio":"14:30","fin":"15:00"}]},"sabado":null,"domingo":null}'
    );