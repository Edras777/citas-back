USE `citas`;
DROP procedure IF EXISTS `pre_autenticar`;
DELIMITER $$
CREATE PROCEDURE `pre_autenticar` (usuario VARCHAR(256)) 
BEGIN
	SELECT u.id,
		u.email,
        u.nombre,
        c.usuario,
        c.password,
        c.primer_login AS primerLogin
	FROM usuarios u
    INNER JOIN usuarios_configuraciones c
	ON u.id = c.id_usuario
	WHERE c.usuario = usuario;
END $$