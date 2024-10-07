USE `citas`;
DROP procedure IF EXISTS `obtener_clientes`;
DELIMITER $$
CREATE PROCEDURE `obtener_clientes` () 
BEGIN
	SELECT id,
		fecha_creacion,
		nombre,
		apellido,
        email,
        telefono
	FROM clientes;
END $$