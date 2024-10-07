USE `citas`;
DROP procedure IF EXISTS `guardar_cita`;
DELIMITER $$ 
CREATE PROCEDURE `guardar_cita`(
    id_servicio INT,
    id_proveedor INT,
    fecha_inicio DATETIME,
    fecha_final DATETIME,
    nombre_cliente VARCHAR(256),
    apellido_cliente VARCHAR(512),
    correo_cliente VARCHAR(512),
    telefono_cliente VARCHAR(128),
    notas_cliente TEXT
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
		-- Insertar en la tabla `clientes`
		INSERT INTO clientes (nombre, apellido, email, telefono, notas)
		VALUES (
				nombre_cliente,
				apellido_cliente,
				correo_cliente,
				telefono_cliente,
				notas_cliente
			);
		-- Recuperar el ID del cliente recién insertado
		SET @id_cliente = LAST_INSERT_ID();
		-- Insertar en la tabla `citas`
		INSERT INTO citas (
				fecha_inicio,
				fecha_fin,
				notas,
				estado,
				id_usuario_proveedor,
				id_usuario_cliente,
				id_servicio,
				fecha_reserva
			)
		VALUES (
				fecha_inicio,
				fecha_final,
				notas_cliente,
				'RESERVADA',
				id_proveedor,
				@id_cliente,
				id_servicio,
				NOW()
			);
	-- Confirmar la transacción
	COMMIT;
END $$