USE `citas`;
DROP procedure IF EXISTS `obtener_bitacora_citas`;
DELIMITER $$ 
CREATE PROCEDURE `obtener_bitacora_citas` () BEGIN
	
	SELECT 
		c.id, 
		c.fecha_creacion,
        c.fecha_actualizacion,
        c.fecha_inicio, 
        c.fecha_fin,
        c.notas,
        c.estado,
		CONCAT(u.nombre, ' ', u.apellido) AS proveedor,
        CONCAT(cli.nombre, ' ', cli.apellido) AS cliente,
        s.nombre AS servicio,
        s.id AS idServicio
	FROM citas AS c
    INNER JOIN servicios AS s
    ON c.id_servicio = s.id
    INNER JOIN clientes AS cli
    ON cli.id = c.id_usuario_cliente
    INNER JOIN usuarios AS u
    ON c.id_usuario_proveedor = u.id;
END $$
