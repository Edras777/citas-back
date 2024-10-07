USE `citas`;
DROP procedure IF EXISTS `guardar_servicio`;
DELIMITER $$ 
CREATE PROCEDURE `guardar_servicio`(
	nombre VARCHAR(256),
	precio DECIMAL(10,2),
	duracion INT,
	privado TINYINT,
	descripcion TEXT
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
		-- Insertar en la tabla `servicios`
		INSERT INTO servicios (nombre, precio, duracion, privado, descripcion)
		VALUES (
				nombre,
				precio,
				duracion,
				privado,
				descripcion
			);
	-- Confirmar la transacción
	COMMIT;
END $$