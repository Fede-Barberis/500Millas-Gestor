-- Ejecutar una vez en la base db500millas antes de habilitar recibos en producción.
-- Los pagos se almacenan como movimientos; no se modifican ni eliminan ventas.
CREATE TABLE IF NOT EXISTS recibos_pago (
    id_recibo INT NOT NULL AUTO_INCREMENT,
    fecha_pago DATE NOT NULL,
    fecha_emision DATE NOT NULL,
    cliente VARCHAR(100) NOT NULL,
    medio_pago VARCHAR(40) NOT NULL,
    observaciones TEXT NULL,
    total DECIMAL(12,2) NOT NULL,
    PRIMARY KEY (id_recibo),
    INDEX idx_recibos_pago_cliente (cliente),
    INDEX idx_recibos_pago_fecha (fecha_pago)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS recibos_pago_ventas (
    id_recibo_venta INT NOT NULL AUTO_INCREMENT,
    id_recibo INT NOT NULL,
    id_venta INT NOT NULL,
    importe DECIMAL(12,2) NOT NULL,
    PRIMARY KEY (id_recibo_venta),
    INDEX idx_recibos_pago_ventas_recibo (id_recibo),
    INDEX idx_recibos_pago_ventas_venta (id_venta),
    CONSTRAINT fk_recibos_pago_ventas_recibo
        FOREIGN KEY (id_recibo) REFERENCES recibos_pago (id_recibo)
        ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_recibos_pago_ventas_venta
        FOREIGN KEY (id_venta) REFERENCES ventas (id_venta)
        ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

-- Historial inmutable del remito emitido para cada venta.
CREATE TABLE IF NOT EXISTS remitos (
    id_remito INT NOT NULL AUTO_INCREMENT,
    id_venta INT NOT NULL,
    numero_remito VARCHAR(30) NOT NULL,
    fecha_emision DATE NOT NULL,
    documento JSON NOT NULL,
    PRIMARY KEY (id_remito),
    UNIQUE KEY uq_remitos_venta (id_venta),
    UNIQUE KEY uq_remitos_numero (numero_remito),
    CONSTRAINT fk_remitos_venta
        FOREIGN KEY (id_venta) REFERENCES ventas (id_venta)
        ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;
