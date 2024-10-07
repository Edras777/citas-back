USE `citas`;
DROP procedure IF EXISTS `citas_reservadas_proveedor`;
DELIMITER $$ 
CREATE PROCEDURE `citas_reservadas_proveedor` (id_proveedor INT) BEGIN
	SELECT fecha_inicio AS fechaInicio,
		fecha_fin as fechaFin
	FROM citas
	WHERE id_usuario_proveedor = id_proveedor
		AND estado = 'RESERVADA';
END $$