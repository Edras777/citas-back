USE `citas`;
DROP procedure IF EXISTS `recuperar_usuario`;
DELIMITER $$ 
CREATE PROCEDURE `recuperar_usuario`(
	correo VARCHAR(250),
    username VARCHAR(250),
    pass VARCHAR(250)
) 
BEGIN
	-- Declarar variables para capturar el mensaje de error
    DECLARE v_errorMsg VARCHAR(125);	
    
    -- Handler para manejar excepciones de SQL
    DECLARE EXIT HANDLER FOR SQLEXCEPTION 
    BEGIN
        -- Obtener los detalles del error
        GET DIAGNOSTICS CONDITION 1
            v_errorMsg =  MESSAGE_TEXT;         -- Captura el mensaje del error

        -- Rollback en caso de error
        ROLLBACK;
        
        -- Lanzar un error con el mensaje capturado
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = v_errorMsg;
    END;

	-- Iniciar la transacción
	START TRANSACTION;
   
		IF EXISTS (SELECT email FROM usuarios u
						INNER JOIN usuarios_configuraciones AS  c WHERE u.email = correo
						AND c.usuario = username
					) THEN
        BEGIN
			UPDATE usuarios_configuraciones 
					SET password = pass WHERE usuario = username;
			
            SELECT email from usuarios WHERE email = correo;
        END;
        END IF;
	-- Confirmar la transacción
	COMMIT;
END $$