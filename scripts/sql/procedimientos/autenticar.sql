USE `citas`;
DROP procedure IF EXISTS `autenticar`;
DELIMITER $$
CREATE PROCEDURE `autenticar` (username VARCHAR(256), codigo VARCHAR(256)) 
BEGIN
   -- Selecciona los detalles del usuario y valida el token
	SELECT u.id,
		u.email,
        u.nombre,
        u.apellido,
        c.usuario,
        c.password,
        c.primer_login AS primerLogin,
        r.id AS idRol,
        r.nombre AS nombreRol,
        r.tipo AS tipoRol
	FROM usuarios u
    INNER JOIN usuarios_configuraciones c
	ON u.id = c.id_usuario
    INNER JOIN tokens t
    ON t.id_usuario = u.id
    INNER JOIN roles r
    ON r.id = u.id_rol
	WHERE c.usuario = username AND t.token = codigo;
    
     -- Si el token y el usuario son válidos, elimina el token
    DELETE FROM tokens WHERE id_usuario = (SELECT id_usuario FROM usuarios_configuraciones WHERE usuario = username) AND token = codigo;
    
END $$