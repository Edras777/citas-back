USE `citas`;
DROP procedure IF EXISTS `obtener_servicios_por_usuario`;
DELIMITER $$
CREATE PROCEDURE `obtener_servicios_por_usuario` (idUsuario INT) 
BEGIN
	SELECT id_servicio AS idServicio
	FROM servicios_usuarios
	WHERE id_usuario = idUsuario;
END $$
