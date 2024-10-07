USE `citas`;
DROP procedure IF EXISTS `citas_reservadas_por_fecha`;
DELIMITER $$ 
CREATE PROCEDURE `citas_reservadas_por_fecha` (fecha DATETIME, id_proveedor INT) BEGIN
	SELECT fecha_inicio AS fechaInicio,
		fecha_fin as fechaFin
	FROM citas
	WHERE DATE(fecha_inicio) = DATE(fecha)
		AND id_usuario_proveedor = id_proveedor
		AND estado = 'RESERVADA';
END $$