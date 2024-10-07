USE `citas`;
DROP procedure IF EXISTS `guardar_token`;
DELIMITER $$ 
CREATE PROCEDURE `guardar_token`(
    idUsuario INT,
    token VARCHAR(256)
) 
BEGIN
	-- Declarar variables para capturar el mensaje de error
    DECLARE v_errorMsg VARCHAR(125);

    -- Handler para manejar excepciones de SQL
    DECLARE EXIT HANDLER FOR SQLEXCEPTION 
    BEGIN
        -- Obtener los detalles del error
        GET DIAGNOSTICS CONDITION 1
            v_errorMsg =  MESSAGE_TEXT; -- Captura el mensaje del error

        -- Rollback en caso de error
        ROLLBACK;
        
        -- Lanzar un error con el mensaje capturado
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = v_errorMsg;
    END;
    
	-- Iniciar la transacción
	START TRANSACTION;
		-- Insertar en la tabla `tokens`
		INSERT INTO tokens (id_usuario, token)
		VALUES (
				idUsuario,
                token
			);
	-- Confirmar la transacción
	COMMIT;
END $$