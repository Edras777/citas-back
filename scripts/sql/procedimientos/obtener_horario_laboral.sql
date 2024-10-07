USE `citas`;
DROP procedure IF EXISTS `obtener_horario_laboral`;
DELIMITER $$
CREATE PROCEDURE `obtener_horario_laboral`() 
BEGIN
	SELECT valor
	FROM configuraciones_globales
	WHERE nombre = 'horario_laboral';
END $$