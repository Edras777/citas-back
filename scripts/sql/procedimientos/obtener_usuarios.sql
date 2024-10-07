USE `citas`;
DROP procedure IF EXISTS `obtener_usuarios`;
DELIMITER $$
CREATE PROCEDURE `obtener_usuarios` () 
BEGIN
	SELECT u.id,
		u.fecha_creacion,
		u.fecha_actualizacion,
		u.nombre,
		u.apellido,
		u.email,
		u.telefono,
        u.direccion,
		u.privado,
        c.usuario as username
	FROM usuarios u
    INNER JOIN usuarios_configuraciones c
	ON u.id = c.id_usuario;
END $$