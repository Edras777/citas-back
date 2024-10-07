USE `citas`;
DROP PROCEDURE IF EXISTS `guardar_cita_cliente`;
DELIMITER $$ 
CREATE PROCEDURE `guardar_cita_cliente`(
    IN id_servicio INT,
    IN id_proveedor INT,
    IN fecha_inicio DATETIME,
    IN fecha_final DATETIME,
    IN nombre_cliente VARCHAR(256),
    IN apellido_cliente VARCHAR(512),
    IN correo_cliente VARCHAR(512),
    IN telefono_cliente VARCHAR(128),
    IN notas_cliente TEXT,
    IN token_cliente VARCHAR(512)
) 
BEGIN
    -- Declarar variables
    DECLARE v_errorMsg VARCHAR(125);
    DECLARE v_id_cliente INT;
    DECLARE v_token_valido INT DEFAULT 0;

    -- Handler para manejar excepciones de SQL
    DECLARE EXIT HANDLER FOR SQLEXCEPTION 
    BEGIN
        -- Obtener los detalles del error
        GET DIAGNOSTICS CONDITION 1
            v_errorMsg = MESSAGE_TEXT; -- Captura el mensaje del error

        -- Rollback en caso de error
        ROLLBACK;
        
        -- Lanzar un error con el mensaje capturado
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = v_errorMsg;
    END;
    
    -- Iniciar la transacción
    START TRANSACTION;

        -- Verificar si el token es válido para el correo del cliente
        SELECT COUNT(*) INTO v_token_valido
        FROM tokens t
        WHERE t.correo = correo_cliente AND t.token = token_cliente;

        -- Si no existe un token válido, lanzamos un error
        IF v_token_valido = 0 THEN
            SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Token de verificación no válido o no encontrado.';
        END IF;

        -- Verificar si el cliente existe por el correo
        SELECT c.id INTO v_id_cliente
        FROM clientes c
        WHERE c.email = correo_cliente;

        -- Si el cliente ya existe, actualizamos su información
        IF v_id_cliente IS NOT NULL THEN
            UPDATE clientes
            SET nombre = nombre_cliente,
                apellido = apellido_cliente,
                telefono = telefono_cliente,
                notas = notas_cliente
            WHERE id = v_id_cliente;
        ELSE
            -- Si no existe, lo creamos
            INSERT INTO clientes (nombre, apellido, email, telefono, notas)
            VALUES (
                nombre_cliente,
                apellido_cliente,
                correo_cliente,
                telefono_cliente,
                notas_cliente
            );

            -- Recuperar el ID del cliente recién insertado
            SET v_id_cliente = LAST_INSERT_ID();
        END IF;

        -- Insertar en la tabla `citas` con el ID del cliente encontrado o creado
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
            v_id_cliente,
            id_servicio,
            NOW()
        );
        
		-- elimina el token
		DELETE FROM tokens WHERE correo = correo_cliente;

    -- Confirmar la transacción
    COMMIT;
END $$ 
DELIMITER ;
