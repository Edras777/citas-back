USE `citas`;
DROP procedure IF EXISTS `obtener_usuario`;
DELIMITER $$
CREATE PROCEDURE `obtener_usuario` (idUsuario INT) 
BEGIN
	SELECT u.id,
		u.nombre,
		u.apellido,
		u.email,
		u.telefono,
        u.direccion,
        c.usuario as username
	FROM usuarios u
    INNER JOIN usuarios_configuraciones c
	ON u.id = c.id_usuario
    WHERE u.id = idUsuario;
END $$