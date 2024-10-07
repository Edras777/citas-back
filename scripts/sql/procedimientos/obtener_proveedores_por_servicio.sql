USE `citas`;
DROP procedure IF EXISTS `obtener_proveedores_por_servicio`;
DELIMITER $$
CREATE PROCEDURE `obtener_proveedores_por_servicio`(id_servicio INT) 
BEGIN
	SELECT id,
		nombre,
		apellido
		FROM usuarios AS u
		INNER JOIN servicios_usuarios AS s ON u.id = s.id_usuario
	WHERE u.privado <> 1
		AND s.id_servicio = id_servicio;
END $$ 