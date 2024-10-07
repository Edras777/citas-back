-- Crear base de datos
DROP DATABASE IF EXISTS `citas`;
CREATE DATABASE IF NOT EXISTS `citas`;
USE `citas`;
-- Tabla de roles
DROP TABLE IF EXISTS `roles`;
CREATE TABLE `roles` (
  `id` int NOT NULL AUTO_INCREMENT,
  `fecha_creacion` datetime DEFAULT NOW(),
  `fecha_actualizacion` datetime DEFAULT NOW(),
  `nombre` varchar(256) DEFAULT NULL,
  `tipo` varchar(256) DEFAULT NULL,
  PRIMARY KEY (`id`)
);
-- Tabla de usuarios proveedores de las citas
DROP TABLE IF EXISTS `usuarios`;
CREATE TABLE `usuarios` (
  `id` int NOT NULL AUTO_INCREMENT,
  `fecha_creacion` datetime DEFAULT NOW(),
  `fecha_actualizacion` datetime DEFAULT NOW(),
  `nombre` varchar(256) DEFAULT NULL,
  `apellido` varchar(512) DEFAULT NULL,
  `email` varchar(512) DEFAULT NULL,
  `telefono` varchar(128) DEFAULT NULL,
  `direccion` varchar(256) DEFAULT NULL,
  `privado` tinyint DEFAULT '0',
  `id_rol` int DEFAULT 2,
  PRIMARY KEY (`id`),
  KEY `id_roles` (`id_rol`),
  CONSTRAINT `usuarios_roles` FOREIGN KEY (`id_rol`) REFERENCES `roles` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
);

-- Tabla para guardar los tokens para verificación del login
DROP TABLE IF EXISTS `tokens`;
CREATE TABLE `tokens` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `id_usuario` INT NULL,
  `fecha_creacion` DATETIME DEFAULT NOW(),
  `token` VARCHAR(256) NOT NULL,
  `correo` VARCHAR(256) NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `tokens_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
);

-- Tabla de configuraciones usuario
DROP TABLE IF EXISTS `usuarios_configuraciones`;
CREATE TABLE `usuarios_configuraciones` (
  `id_usuario` int NOT NULL,
  `fecha_creacion` datetime DEFAULT NOW(),
  `fecha_actualizacion` datetime DEFAULT NOW(),
  `usuario` varchar(256) DEFAULT NULL,
  `password` varchar(512) DEFAULT NULL,
  `primer_login` tinyint DEFAULT '1', 
  `plan_trabajo` text,
  PRIMARY KEY (`id_usuario`),
  CONSTRAINT `usuarios_configuraciones_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
);
-- Tabla de clientes
DROP TABLE IF EXISTS `clientes`;
CREATE TABLE `clientes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `fecha_creacion` datetime DEFAULT NOW(),
  `fecha_actualizacion` datetime DEFAULT NOW(),
  `nombre` varchar(256) DEFAULT NULL,
  `apellido` varchar(512) DEFAULT NULL,
  `email` varchar(512) DEFAULT NULL,
  `telefono` varchar(128) DEFAULT NULL,
  `direccion` varchar(256) DEFAULT NULL,
  `notas` text,
  PRIMARY KEY (`id`)
);
-- Tabla de configuraciones cliente
DROP TABLE IF EXISTS `clientes_configuraciones`;
CREATE TABLE `clientes_configuraciones` (
  `id_cliente` int NOT NULL,
  `fecha_creacion` datetime DEFAULT NOW(),
  `fecha_actualizacion` datetime DEFAULT NOW(),
  `usuario` varchar(256) DEFAULT NULL,
  `password` varchar(512) DEFAULT NULL,
  PRIMARY KEY (`id_cliente`),
  CONSTRAINT `clientes_configuraciones_cliente` FOREIGN KEY (`id_cliente`) REFERENCES `clientes` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
);
-- Tabla de servicios
DROP TABLE IF EXISTS `servicios`;
CREATE TABLE `servicios` (
  `id` int NOT NULL AUTO_INCREMENT,
  `fecha_creacion` datetime DEFAULT NOW(),
  `fecha_actualizacion` datetime DEFAULT NOW(),
  `nombre` varchar(256) DEFAULT NULL,
  `precio` decimal(10, 2) DEFAULT NULL,
  `descripcion` text,
  `ubicacion` text,
  `privado` tinyint DEFAULT '0',
  `duracion` int DEFAULT null,
  PRIMARY KEY (`id`)
);
-- Tabla de citas
DROP TABLE IF EXISTS `citas`;
CREATE TABLE `citas` (
  `id` int NOT NULL AUTO_INCREMENT,
  `fecha_creacion` datetime DEFAULT NOW(),
  `fecha_actualizacion` datetime DEFAULT NOW(),
  `fecha_reserva` datetime DEFAULT NULL,
  `fecha_inicio` datetime DEFAULT NULL,
  `fecha_fin` datetime DEFAULT NULL,
  `ubicacion` text,
  `notas` text,
  `estado` varchar(512) DEFAULT '',
  `tiene_disponibilidad` tinyint NOT NULL DEFAULT '0',
  `id_usuario_proveedor` int DEFAULT NULL,
  `id_usuario_cliente` int DEFAULT NULL,
  `id_servicio` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `id_usuario_proveedor` (`id_usuario_proveedor`),
  KEY `id_usuario_cliente` (`id_usuario_cliente`),
  KEY `id_servicio` (`id_servicio`),
  CONSTRAINT `citas_servicios` FOREIGN KEY (`id_servicio`) REFERENCES `servicios` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `citas_usuarios_cliente` FOREIGN KEY (`id_usuario_cliente`) REFERENCES `clientes` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `citas_usuarios_proveedor` FOREIGN KEY (`id_usuario_proveedor`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
);
-- Tabla de servicios y proveedores
DROP TABLE IF EXISTS `servicios_usuarios`;
CREATE TABLE `servicios_usuarios` (
  `id_usuario` int NOT NULL,
  `id_servicio` int NOT NULL,
  PRIMARY KEY (`id_usuario`, `id_servicio`),
  KEY `servicios_usuarios_servicios` (`id_servicio`),
  CONSTRAINT `servicios_usuarios_servicios` FOREIGN KEY (`id_servicio`) REFERENCES `servicios` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `servicios_usuarios_usuarios` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
);
-- Tabla de configuraciones
DROP TABLE IF EXISTS `configuraciones`;
CREATE TABLE `configuraciones_globales` (
  `id` int NOT NULL AUTO_INCREMENT,
  `fecha_creacion` datetime DEFAULT NOW(),
  `fecha_actualizacion` datetime DEFAULT NOW(),
  `nombre` varchar(512) DEFAULT NULL,
  `valor` longtext,
  PRIMARY KEY (`id`)
);