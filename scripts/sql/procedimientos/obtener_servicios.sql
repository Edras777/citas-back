USE `citas`;
DROP procedure IF EXISTS `obtener_servicios`;
DELIMITER $$
CREATE PROCEDURE `obtener_servicios` () 
BEGIN
	SELECT id,
		fecha_creacion,
		fecha_actualizacion,
		nombre,
		precio,
		descripcion,
		privado,
		duracion
	FROM servicios;
END $$