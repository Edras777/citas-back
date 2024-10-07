USE `citas`;
DROP procedure IF EXISTS `obtener_servicios_cliente`;
DELIMITER $$
CREATE PROCEDURE `obtener_servicios_cliente` () 
BEGIN
	SELECT id,
		nombre,
		precio,
		descripcion,
		duracion
	FROM servicios
	WHERE privado <> 1;
END $$