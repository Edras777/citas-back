USE `citas`;
DROP procedure IF EXISTS `obtener_citas`;
DELIMITER $$ 
CREATE PROCEDURE `obtener_citas` (rol VARCHAR(250), idUsuario INT) BEGIN
	UPDATE citas 
		SET estado = 'VENCIDA',
			fecha_actualizacion = NOW()
		WHERE fecha_inicio < NOW();
        
	SELECT 
		c.id, 
        c.fecha_inicio AS `start`, 
        c.fecha_fin AS `end`,
        CONCAT(s.nombre, ' - ', cli.nombre, ' ', cli.apellido) AS title,
        s.id AS idServicio,
        c.id_usuario_proveedor AS resourceId,
        cli.nombre,
        cli.apellido,
        cli.email AS correo,
        cli.telefono,
        cli.notas
	FROM citas AS c
    INNER JOIN servicios AS s
    ON c.id_servicio = s.id
    INNER JOIN clientes AS cli
    ON cli.id = c.id_usuario_cliente
	WHERE estado = 'RESERVADA'
	AND (rol = 'ADMIN' OR c.id_usuario_proveedor = idUsuario);
END $$