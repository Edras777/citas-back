USE `citas`;
DROP procedure IF EXISTS `obtener_proveedores`;
DELIMITER $$ 
CREATE PROCEDURE `obtener_proveedores` (rol VARCHAR(250), idUsuario INT) BEGIN
	SELECT 
		id, 
        CONCAT(nombre, ' ', apellido) AS title
	FROM usuarios
	WHERE privado = 0
    AND (rol = 'ADMIN' OR id = idUsuario);
END $$