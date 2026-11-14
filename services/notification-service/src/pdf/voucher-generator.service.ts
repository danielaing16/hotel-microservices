import { Injectable, Logger } from '@nestjs/common';
import * as PDFDocument from 'pdfkit';
import * as QRCode from 'qrcode';
import { VoucherData } from './interfaces/voucher-data.interface';

@Injectable()
export class VoucherGeneratorService {
  private readonly logger = new Logger(VoucherGeneratorService.name);

  /**
   * Formatea un importe a Pesos Colombianos oficiales (COP)
   */
  private formatCOP(amount: number): string {
    const raw = Number(amount) || 0;
    const copVal = raw > 0 && raw < 50000 ? Math.round(raw * 4000) : Math.round(raw);
    const formatted = new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    }).format(copVal);
    return `${formatted} COP`;
  }

  /**
   * Genera un Voucher de Confirmación en PDF con diseño limpio, elegante y sin mojibake
   */
  async generateVoucherPdf(data: VoucherData): Promise<Buffer> {
    this.logger.log(`Generando Voucher PDF oficial para la reserva: ${data.bookingReference}`);

    const totalCOP = Number(data.totalAmount) || 0;
    const copVal = totalCOP > 0 && totalCOP < 50000 ? totalCOP * 4000 : totalCOP;
    const subtotal = Math.round(copVal / 1.19);
    const iva = Math.round(copVal - subtotal);

    const adminName = data.adminName || 'Mauricio Medina';
    const adminEmail = data.adminEmail || 'mauromedina2508@gmail.com';
    const adminPhone = data.adminPhone || '+57 304 659 8870';

    // Generar el código QR en Buffer de alta definición
    const qrPayload =
      data.qrPayload ||
      JSON.stringify({
        ref: data.bookingReference,
        id: data.bookingId,
        guest: data.guestName,
        guestEmail: data.guestEmail,
        hotel: data.hotelName,
        checkIn: data.checkInDate,
        checkOut: data.checkOutDate,
        totalCOP: copVal,
        admin: adminName,
        adminContact: adminPhone,
        verified: true,
      });

    const qrBuffer = await QRCode.toBuffer(qrPayload, {
      width: 140,
      margin: 1,
      color: {
        dark: '#0c1a16',
        light: '#ffffff',
      },
      errorCorrectionLevel: 'M',
    });

    return new Promise<Buffer>((resolve, reject) => {
      try {
        const doc = new PDFDocument({
          size: 'A4',
          margin: 40,
          info: {
            Title: `Voucher de Confirmación - ${data.bookingReference}`,
            Author: 'Travel & Resorts Luxury Collection',
            Subject: 'Voucher Oficial de Confirmación de Hospedaje en Colombia',
            Keywords: 'Hotel, Voucher, Confirmación, QR, Travel Resorts, Colombia',
            CreationDate: new Date(),
          },
        });

        const buffers: Buffer[] = [];
        doc.on('data', (chunk) => buffers.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(buffers)));
        doc.on('error', (err) => reject(err));

        const pageWidth = 515;
        const startX = 40;

        // ==========================================
        // 1. CABECERA PRINCIPAL (LUXURY EDITORIAL BAR)
        // ==========================================
        const headerY = 40;
        const headerHeight = 72;

        // Fondo verde esmeralda institucional
        doc
          .roundedRect(startX, headerY, pageWidth, headerHeight, 8)
          .fill('#0c1a16');

        // Borde dorado sutil
        doc
          .roundedRect(startX, headerY, pageWidth, headerHeight, 8)
          .lineWidth(1)
          .stroke('#d97706');

        // Marca institucional
        doc
          .fillColor('#d4af37')
          .fontSize(18)
          .font('Helvetica-Bold')
          .text('TRAVEL & RESORTS', startX + 18, headerY + 16);

        doc
          .fillColor('#cbd5e1')
          .fontSize(7.5)
          .font('Helvetica')
          .text('SANTUARIOS & RETIROS PRIVADOS DE COLOMBIA', startX + 18, headerY + 40);

        // Lado derecho: Voucher + Referencia + Estado
        doc
          .fillColor('#ffffff')
          .fontSize(9)
          .font('Helvetica-Bold')
          .text('COMPROBANTE OFICIAL DE RESERVA', startX + 260, headerY + 14, {
            width: 235,
            align: 'right',
          });

        doc
          .fillColor('#fbbf24')
          .fontSize(14)
          .font('Helvetica-Bold')
          .text(data.bookingReference, startX + 260, headerY + 28, {
            width: 235,
            align: 'right',
          });

        // Indicador de Estado: círculo verde vectorial + texto limpio
        const statusY = headerY + 48;
        doc.circle(startX + 372, statusY + 4, 3.5).fill('#10b981');

        doc
          .fillColor('#10b981')
          .fontSize(8.5)
          .font('Helvetica-Bold')
          .text('ESTADO: CONFIRMADO & GARANTIZADO', startX + 260, statusY, {
            width: 235,
            align: 'right',
          });

        // ==========================================
        // 2. FILA 1: HUÉSPED vs ADMINISTRACIÓN (2 COLUMNAS)
        // ==========================================
        const row1Y = 122;
        const cardWidth = 248;
        const row1Height = 98;

        // Tarjeta Huésped (Izquierda)
        doc
          .roundedRect(startX, row1Y, cardWidth, row1Height, 6)
          .fillAndStroke('#faf9f6', '#e2e8f0');

        // Barra decorativa izquierda
        doc.rect(startX, row1Y + 8, 3, 16).fill('#0c1a16');

        doc
          .fillColor('#0c1a16')
          .fontSize(9)
          .font('Helvetica-Bold')
          .text('DATOS DEL HUÉSPED TITULAR', startX + 12, row1Y + 11);

        doc
          .fillColor('#64748b')
          .fontSize(7.5)
          .font('Helvetica-Bold')
          .text('NOMBRE COMPLETO:', startX + 12, row1Y + 28);

        doc
          .fillColor('#0f172a')
          .fontSize(9.5)
          .font('Helvetica-Bold')
          .text(data.guestName || 'Huésped Registrado', startX + 12, row1Y + 39, { width: 224 });

        doc
          .fillColor('#64748b')
          .fontSize(7.5)
          .font('Helvetica')
          .text('CORREO:', startX + 12, row1Y + 56);

        doc
          .fillColor('#0f172a')
          .fontSize(8.5)
          .font('Helvetica')
          .text(data.guestEmail || 'isaconsii08@gmail.com', startX + 60, row1Y + 56, { width: 176 });

        doc
          .fillColor('#64748b')
          .fontSize(7.5)
          .font('Helvetica')
          .text('TELÉFONO:', startX + 12, row1Y + 70);

        doc
          .fillColor('#334155')
          .fontSize(8.5)
          .font('Helvetica')
          .text(data.guestPhone || '+57 304 659 8870', startX + 65, row1Y + 70, { width: 170 });

        doc
          .fillColor('#64748b')
          .fontSize(7.5)
          .font('Helvetica')
          .text('OCUPACIÓN:', startX + 12, row1Y + 84);

        doc
          .fillColor('#0c1a16')
          .fontSize(8.5)
          .font('Helvetica-Bold')
          .text(`${data.guestsCount || 2} Persona(s)`, startX + 75, row1Y + 84);

        // Tarjeta Administrador General & Concierge (Derecha)
        const rightCardX = startX + cardWidth + 19;
        doc
          .roundedRect(rightCardX, row1Y, cardWidth, row1Height, 6)
          .fillAndStroke('#faf9f6', '#e2e8f0');

        doc.rect(rightCardX, row1Y + 8, 3, 16).fill('#d97706');

        doc
          .fillColor('#0c1a16')
          .fontSize(9)
          .font('Helvetica-Bold')
          .text('ADMINISTRACIÓN & CONCIERGE OFICIAL', rightCardX + 12, row1Y + 11);

        doc
          .fillColor('#64748b')
          .fontSize(7.5)
          .font('Helvetica-Bold')
          .text('ADMINISTRADOR GENERAL:', rightCardX + 12, row1Y + 28);

        doc
          .fillColor('#0f172a')
          .fontSize(9.5)
          .font('Helvetica-Bold')
          .text(adminName, rightCardX + 12, row1Y + 39, { width: 224 });

        doc
          .fillColor('#64748b')
          .fontSize(7.5)
          .font('Helvetica')
          .text('CORREO:', rightCardX + 12, row1Y + 56);

        doc
          .fillColor('#0c1a16')
          .fontSize(8.5)
          .font('Helvetica-Bold')
          .text(adminEmail, rightCardX + 60, row1Y + 56, { width: 176 });

        doc
          .fillColor('#64748b')
          .fontSize(7.5)
          .font('Helvetica')
          .text('WHATSAPP:', rightCardX + 12, row1Y + 70);

        doc
          .fillColor('#059669')
          .fontSize(8.5)
          .font('Helvetica-Bold')
          .text(adminPhone, rightCardX + 70, row1Y + 70, { width: 165 });

        doc
          .fillColor('#64748b')
          .fontSize(7.5)
          .font('Helvetica')
          .text('ATENCIÓN:', rightCardX + 12, row1Y + 84);

        doc
          .fillColor('#0f172a')
          .fontSize(8.5)
          .font('Helvetica')
          .text('Concierge y soporte directo 24/7', rightCardX + 68, row1Y + 84);

        // ==========================================
        // 3. FILA 2: DESTINO vs FECHAS DE ESTANCIA (2 COLUMNAS)
        // ==========================================
        const row2Y = 228;
        const row2Height = 98;

        // Tarjeta Hotel / Destino (Izquierda)
        doc
          .roundedRect(startX, row2Y, cardWidth, row2Height, 6)
          .fillAndStroke('#faf9f6', '#e2e8f0');

        doc.rect(startX, row2Y + 8, 3, 16).fill('#0c1a16');

        doc
          .fillColor('#0c1a16')
          .fontSize(9)
          .font('Helvetica-Bold')
          .text('DESTINO Y ALOJAMIENTO', startX + 12, row2Y + 11);

        doc
          .fillColor('#64748b')
          .fontSize(7.5)
          .font('Helvetica-Bold')
          .text('HOTEL SELECCIONADO:', startX + 12, row2Y + 28);

        doc
          .fillColor('#0f172a')
          .fontSize(9.5)
          .font('Helvetica-Bold')
          .text(data.hotelName || 'Bogotá Grand Plaza & Financial Center', startX + 12, row2Y + 39, { width: 224 });

        doc
          .fillColor('#64748b')
          .fontSize(7.5)
          .font('Helvetica')
          .text('DIRECCIÓN:', startX + 12, row2Y + 56);

        doc
          .fillColor('#334155')
          .fontSize(8)
          .font('Helvetica')
          .text(`${data.hotelAddress || 'Carrera 7 # 71-52, Zona Financiera'}, ${data.hotelCity || 'Bogotá D.C., Colombia'}`, startX + 68, row2Y + 56, {
            width: 168,
          });

        doc
          .fillColor('#64748b')
          .fontSize(7.5)
          .font('Helvetica')
          .text('HABITACIÓN:', startX + 12, row2Y + 76);

        doc
          .fillColor('#0c1a16')
          .fontSize(8.5)
          .font('Helvetica-Bold')
          .text(data.roomTypeName || 'Suite Ejecutiva Diplomática', startX + 75, row2Y + 76, { width: 160 });

        // Tarjeta Fechas y Horarios (Derecha)
        doc
          .roundedRect(rightCardX, row2Y, cardWidth, row2Height, 6)
          .fillAndStroke('#faf9f6', '#e2e8f0');

        doc.rect(rightCardX, row2Y + 8, 3, 16).fill('#0c1a16');

        doc
          .fillColor('#0c1a16')
          .fontSize(9)
          .font('Helvetica-Bold')
          .text('CALENDARIO Y HORARIOS DE ESTADÍA', rightCardX + 12, row2Y + 11);

        // Check-in
        doc
          .fillColor('#64748b')
          .fontSize(7.5)
          .font('Helvetica-Bold')
          .text('CHECK-IN (LLEGADA):', rightCardX + 12, row2Y + 28);

        doc
          .fillColor('#0f172a')
          .fontSize(9.5)
          .font('Helvetica-Bold')
          .text(`${data.checkInDate || '2026-11-20'}  (a partir de las ${data.checkInTime || '15:00'} hrs)`, rightCardX + 12, row2Y + 39);

        // Check-out
        doc
          .fillColor('#64748b')
          .fontSize(7.5)
          .font('Helvetica-Bold')
          .text('CHECK-OUT (SALIDA):', rightCardX + 12, row2Y + 56);

        doc
          .fillColor('#0f172a')
          .fontSize(9.5)
          .font('Helvetica-Bold')
          .text(`${data.checkOutDate || '2026-11-25'}  (hasta las ${data.checkOutTime || '11:00'} hrs)`, rightCardX + 12, row2Y + 67);

        // Duración
        doc
          .fillColor('#64748b')
          .fontSize(7.5)
          .font('Helvetica')
          .text('DURACIÓN TOTAL:', rightCardX + 12, row2Y + 84);

        doc
          .fillColor('#d97706')
          .fontSize(8.5)
          .font('Helvetica-Bold')
          .text(`${data.nights || 5} Noche(s) Confirmadas`, rightCardX + 90, row2Y + 84);

        // ==========================================
        // 4. FILA 3: RESUMEN FINANCIERO COP + QR FAST CHECK-IN
        // ==========================================
        const row3Y = 334;
        const financeWidth = 312;
        const qrBoxWidth = 188;
        const row3Height = 168;

        // Tarjeta Financiera (Izquierda)
        doc
          .roundedRect(startX, row3Y, financeWidth, row3Height, 6)
          .fillAndStroke('#faf9f6', '#e2e8f0');

        doc.rect(startX, row3Y + 8, 3, 16).fill('#059669');

        doc
          .fillColor('#0c1a16')
          .fontSize(9)
          .font('Helvetica-Bold')
          .text('LIQUIDACIÓN Y RESUMEN FINANCIERO (COP)', startX + 12, row3Y + 11);

        // Línea divisoria
        doc
          .moveTo(startX + 12, row3Y + 28)
          .lineTo(startX + financeWidth - 12, row3Y + 28)
          .lineWidth(0.5)
          .stroke('#e2e8f0');

        // Subtotal
        doc
          .fillColor('#64748b')
          .fontSize(8)
          .font('Helvetica')
          .text('Subtotal Hospedaje:', startX + 12, row3Y + 36);

        doc
          .fillColor('#0f172a')
          .fontSize(8.5)
          .font('Helvetica-Bold')
          .text(this.formatCOP(subtotal), startX + 150, row3Y + 36, {
            width: financeWidth - 162,
            align: 'right',
          });

        // Impuestos
        doc
          .fillColor('#64748b')
          .fontSize(8)
          .font('Helvetica')
          .text('Impuestos y Tasas (19% IVA Colombia):', startX + 12, row3Y + 52);

        doc
          .fillColor('#0f172a')
          .fontSize(8.5)
          .font('Helvetica-Bold')
          .text(this.formatCOP(iva), startX + 175, row3Y + 52, {
            width: financeWidth - 187,
            align: 'right',
          });

        // Método de Pago
        doc
          .fillColor('#64748b')
          .fontSize(8)
          .font('Helvetica')
          .text('Método de Pago:', startX + 12, row3Y + 68);

        doc
          .fillColor('#0c1a16')
          .fontSize(8)
          .font('Helvetica-Bold')
          .text(data.paymentMethod || 'Transferencia Bancaria / WhatsApp Directo', startX + 100, row3Y + 68, {
            width: financeWidth - 112,
            align: 'right',
          });

        // Referencia
        doc
          .fillColor('#64748b')
          .fontSize(8)
          .font('Helvetica')
          .text('Referencia Transacción:', startX + 12, row3Y + 84);

        doc
          .fillColor('#0f172a')
          .fontSize(8)
          .font('Helvetica-Bold')
          .text(data.paymentId || `PAY-${data.bookingReference}`, startX + 125, row3Y + 84, {
            width: financeWidth - 137,
            align: 'right',
          });

        // Bloque Total Destacado en Verde Esmeralda
        const totalBoxY = row3Y + 104;
        doc
          .roundedRect(startX + 10, totalBoxY, financeWidth - 20, 52, 6)
          .fill('#0c1a16');

        doc
          .fillColor('#cbd5e1')
          .fontSize(7.5)
          .font('Helvetica-Bold')
          .text('TOTAL COBRADO Y LIQUIDADO (PESOS COLOMBIANOS):', startX + 18, totalBoxY + 10);

        doc
          .fillColor('#fbbf24')
          .fontSize(15)
          .font('Helvetica-Bold')
          .text(this.formatCOP(copVal), startX + 18, totalBoxY + 26);

        // Tarjeta Código QR Fast Check-in (Derecha)
        const qrBoxX = startX + financeWidth + 15;
        doc
          .roundedRect(qrBoxX, row3Y, qrBoxWidth, row3Height, 6)
          .fillAndStroke('#ffffff', '#cbd5e1');

        doc
          .fillColor('#0c1a16')
          .fontSize(9)
          .font('Helvetica-Bold')
          .text('FAST CHECK-IN CON QR', qrBoxX + 10, row3Y + 11, {
            width: qrBoxWidth - 20,
            align: 'center',
          });

        // Imprimir imagen del código QR nítido
        doc.image(qrBuffer, qrBoxX + 34, row3Y + 28, {
          width: 120,
          height: 120,
        });

        doc
          .fillColor('#64748b')
          .fontSize(6.8)
          .font('Helvetica')
          .text('Presente este código en recepción para lectura y entrega de llaves directa', qrBoxX + 8, row3Y + 152, {
            width: qrBoxWidth - 16,
            align: 'center',
          });

        // ==========================================
        // 5. FILA 4: PROCEDIMIENTO DE LLEGADA & POLÍTICAS
        // ==========================================
        const policyY = 510;
        const policyHeight = 75;

        doc
          .roundedRect(startX, policyY, pageWidth, policyHeight, 6)
          .fillAndStroke('#faf9f6', '#e2e8f0');

        doc.rect(startX, policyY + 8, 3, 14).fill('#d97706');

        doc
          .fillColor('#0c1a16')
          .fontSize(8.5)
          .font('Helvetica-Bold')
          .text('PROCEDIMIENTO DE LLEGADA Y POLÍTICAS DEL HOTEL', startX + 12, policyY + 9);

        doc
          .fillColor('#475569')
          .fontSize(7.2)
          .font('Helvetica')
          .text(
            '• Check-In oficial a partir de las 15:00 hrs. En caso de llegar antes, la recepción resguardará su equipaje con servicio de Concierge sin costo.\n' +
              '• Cada huésped debe presentar un documento de identidad oficial vigente (Cédula de Ciudadanía, Extranjería o Pasaporte) al registrarse.\n' +
              '• El saldo pendiente (si aplica modalidad de 50% anticipo) puede abonarse directamente en recepción al momento del ingreso.\n' +
              '• Check-Out oficial hasta las 11:00 hrs. Asistencia y consultas de su reserva: mauromedina2508@gmail.com o WhatsApp: +57 304 659 8870.',
            startX + 12,
            policyY + 25,
            { width: pageWidth - 24, lineGap: 2.2 },
          );

        // ==========================================
        // 6. BLOQUE DE GARANTÍA EDITORIAL
        // ==========================================
        const guaranteeY = 594;
        const guaranteeHeight = 36;

        doc
          .roundedRect(startX, guaranteeY, pageWidth, guaranteeHeight, 5)
          .fill('#f1f5f9');

        doc
          .fillColor('#0c1a16')
          .fontSize(7.5)
          .font('Helvetica-Bold')
          .text('RESERVA OFICIAL EMITIDA POR TRAVEL & RESORTS LUXURY COLLECTION', startX + 12, guaranteeY + 8);

        doc
          .fillColor('#64748b')
          .fontSize(6.8)
          .font('Helvetica')
          .text(
            `Operador: Mauricio Medina (Administrador General) • Línea Directa: +57 304 659 8870 • Correo Oficial: mauromedina2508@gmail.com`,
            startX + 12,
            guaranteeY + 20,
          );

        // ==========================================
        // 7. PIE DE PÁGINA TÉCNICO & HORA DE EMISIÓN
        // ==========================================
        const footerY = 770;
        doc
          .moveTo(startX, footerY)
          .lineTo(startX + pageWidth, footerY)
          .lineWidth(0.5)
          .stroke('#cbd5e1');

        doc
          .fillColor('#64748b')
          .fontSize(7.5)
          .font('Helvetica')
          .text('Travel & Resorts Cloud Ecosystem • Microservicio Oficial de Notificaciones & Generación de Vouchers', startX, footerY + 8);

        doc
          .fillColor('#94a3b8')
          .fontSize(7)
          .font('Helvetica')
          .text(
            `Fecha de Emisión: ${new Date().toLocaleString('es-CO')} | ID Reserva: ${data.bookingId} | Página 1 de 1`,
            startX,
            footerY + 19,
          );

        doc.end();
      } catch (err) {
        this.logger.error(`Error generando el documento PDF: ${err.message}`, err.stack);
        reject(err);
      }
    });
  }
}
