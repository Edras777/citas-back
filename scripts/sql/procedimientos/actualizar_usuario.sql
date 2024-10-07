USE `citas`;
DROP procedure IF EXISTS `actualizar_usuario`;
DELIMITER $$ 
CREATE PROCEDURE `actualizar_usuario`(
	idUsuario INT,
	nombre VARCHAR(256),
	apellido VARCHAR(256),
	correo VARCHAR(512),
    telefono VARCHAR(128),
    direccion VARCHAR(256),
    username VARCHAR(256),
	privado TINYINT,
    servicios TEXT,
    pass VARCHAR(256)
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
   
		IF EXISTS (SELECT email FROM usuarios WHERE email = correo AND id <> idUsuario) THEN
        BEGIN
			SELECT 1 AS existeEmail;
        END;
        ELSEIF EXISTS(SELECT usuario FROM usuarios_configuraciones WHERE usuario = username AND id_usuario <> idUsuario) THEN
        BEGIN
			SELECT 1 AS existeUsername;
        END;
        ELSE
        BEGIN
			-- Insertar en la tabla `usuarios`
			UPDATE usuarios SET nombre = nombre, 
								apellido = apellido, 
                                email = correo, 
                                telefono = telefono, 
                                direccion = direccion, 
                                privado = privado,
                                fecha_actualizacion = NOW()
							WHERE id = idUsuario;
            
            UPDATE usuarios_configuraciones SET usuario = username, 
												password = IFNULL(pass, password),
                                                fecha_actualizacion = NOW()
											where id_usuario = idUsuario;
			
            DELETE FROM servicios_usuarios WHERE id_usuario = idUsuario;
            
			SET @i = 0;
            
            WHILE @i < JSON_LENGTH(servicios) DO
				-- Extraer los valores del objeto actual del array
				SET @idServicio = JSON_UNQUOTE(JSON_EXTRACT(servicios, CONCAT('$[', @i, ']')));

				-- Insertar los valores en la tabla
				INSERT INTO servicios_usuarios (id_usuario, id_servicio)
				VALUES (
						idUsuario, 
						@idServicio
					);
				-- Incrementar el índice para el siguiente objeto
				SET @i = @i + 1;
			END WHILE;
		END;
        END IF;
	-- Confirmar la transacción
	COMMIT;
END $$