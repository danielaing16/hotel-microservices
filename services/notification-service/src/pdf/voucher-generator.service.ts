import { Injectable, Logger } from '@nestjs/common';
import * as PDFDocument from 'pdfkit';
import * as QRCode from 'qrcode';
import { VoucherData } from './interfaces/voucher-data.interface';

@Injectable()
export class VoucherGeneratorService {
  private readonly logger = new Logger(VoucherGeneratorService.name);

  /**
   * Genera un Voucher de Confirmación en PDF con diseño elegante y código QR embebido
   */
  async generateVoucherPdf(data: VoucherData): Promise<Buffer> {
    this.logger.log(`Generando Voucher PDF para la reserva: ${data.bookingReference}`);

    // Generar el código QR en Buffer
    const qrPayload =
      data.qrPayload ||
      JSON.stringify({
        ref: data.bookingReference,
        id: data.bookingId,
        guest: data.guestName,
        hotel: data.hotelName,
        checkIn: data.checkInDate,
        checkOut: data.checkOutDate,
        verified: true,
      });

    const qrBuffer = await QRCode.toBuffer(qrPayload, {
      width: 140,
      margin: 1,
      color: {
        dark: '#0f172a',
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
            Author: 'Travel & Resorts Luxury Hotels',
            Subject: 'Voucher Oficial de Confirmación de Hospedaje',
            Keywords: 'Hotel, Voucher, Confirmación, QR, Travel',
            CreationDate: new Date(),
          },
        });

        const buffers: Buffer[] = [];
        doc.on('data', (chunk) => buffers.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(buffers)));
        doc.on('error', (err) => reject(err));

        // Dimensiones útiles: margen 40, ancho página 595.28, ancho útil 515.28
        const pageWidth = 515;
        const startX = 40;

        // ==========================================
        // 1. CABECERA PRINCIPAL ELEGANTE (Luxury Bar)
        // ==========================================
        const headerY = 40;
        const headerHeight = 75;

        // Fondo oscuro degradado/navy
        doc
          .roundedRect(startX, headerY, pageWidth, headerHeight, 8)
          .fill('#0f172a');

        // Borde dorado sutil
        doc
          .roundedRect(startX, headerY, pageWidth, headerHeight, 8)
          .lineWidth(1)
          .stroke('#d97706');

        // Logo Monograma
        doc
          .fillColor('#fbbf24')
          .fontSize(20)
          .font('Helvetica-Bold')
          .text('TRAVEL & RESORTS', startX + 20, headerY + 16);

        doc
          .fillColor('#94a3b8')
          .fontSize(8)
          .font('Helvetica')
          .text('SISTEMA GLOBAL DE HOSPEDAJE Y RESERVAS', startX + 20, headerY + 42);

        // Lado derecho de la cabecera: Título y Código
        doc
          .fillColor('#ffffff')
          .fontSize(10)
          .font('Helvetica-Bold')
          .text('VOUCHER DE CONFIRMACIÓN', startX + 280, headerY + 16, {
            width: 215,
            align: 'right',
          });

        doc
          .fillColor('#fbbf24')
          .fontSize(14)
          .font('Helvetica-Bold')
          .text(data.bookingReference, startX + 280, headerY + 32, {
            width: 215,
            align: 'right',
          });

        doc
          .fillColor('#10b981')
          .fontSize(9)
          .font('Helvetica-Bold')
          .text('● ESTADO: CONFIRMADO & PAGADO', startX + 280, headerY + 50, {
            width: 215,
            align: 'right',
          });

        // ==========================================
        // 2. DETALLES DEL HUÉSPED Y SEDE (2 COLUMNAS)
        // ==========================================
        const cardsY = 130;
        const cardWidth = 248;
        const cardHeight = 110;

        // Tarjeta Huésped (Izquierda)
        doc
          .roundedRect(startX, cardsY, cardWidth, cardHeight, 6)
          .fillAndStroke('#f8fafc', '#e2e8f0');

        doc
          .fillColor('#4f46e5')
          .fontSize(10)
          .font('Helvetica-Bold')
          .text('👤 INFORMACIÓN DEL HUÉSPED', startX + 14, cardsY + 12);

        doc
          .fillColor('#64748b')
          .fontSize(8)
          .font('Helvetica-Bold')
          .text('TITULAR DE LA RESERVA:', startX + 14, cardsY + 30);

        doc
          .fillColor('#0f172a')
          .fontSize(10)
          .font('Helvetica-Bold')
          .text(data.guestName, startX + 14, cardsY + 41);

        doc
          .fillColor('#64748b')
          .fontSize(8)
          .font('Helvetica')
          .text('CORREO:', startX + 14, cardsY + 60);

        doc
          .fillColor('#334155')
          .fontSize(9)
          .font('Helvetica')
          .text(data.guestEmail, startX + 60, cardsY + 60);

        doc
          .fillColor('#64748b')
          .fontSize(8)
          .font('Helvetica')
          .text('TELÉFONO:', startX + 14, cardsY + 76);

        doc
          .fillColor('#334155')
          .fontSize(9)
          .font('Helvetica')
          .text(data.guestPhone || 'No registrado', startX + 65, cardsY + 76);

        doc
          .fillColor('#64748b')
          .fontSize(8)
          .font('Helvetica')
          .text('OCUPACIÓN:', startX + 14, cardsY + 92);

        doc
          .fillColor('#0f172a')
          .fontSize(9)
          .font('Helvetica-Bold')
          .text(`${data.guestsCount} Persona(s)`, startX + 75, cardsY + 92);

        // Tarjeta Hotel (Derecha)
        const rightCardX = startX + cardWidth + 19;
        doc
          .roundedRect(rightCardX, cardsY, cardWidth, cardHeight, 6)
          .fillAndStroke('#f8fafc', '#e2e8f0');

        doc
          .fillColor('#4f46e5')
          .fontSize(10)
          .font('Helvetica-Bold')
          .text('🏨 DESTINO Y ALOJAMIENTO', rightCardX + 14, cardsY + 12);

        doc
          .fillColor('#64748b')
          .fontSize(8)
          .font('Helvetica-Bold')
          .text('HOTEL SELECCIONADO:', rightCardX + 14, cardsY + 30);

        doc
          .fillColor('#0f172a')
          .fontSize(10)
          .font('Helvetica-Bold')
          .text(data.hotelName, rightCardX + 14, cardsY + 41, { width: 220 });

        doc
          .fillColor('#64748b')
          .fontSize(8)
          .font('Helvetica')
          .text('DIRECCIÓN:', rightCardX + 14, cardsY + 60);

        doc
          .fillColor('#334155')
          .fontSize(8.5)
          .font('Helvetica')
          .text(`${data.hotelAddress}, ${data.hotelCity}`, rightCardX + 65, cardsY + 60, {
            width: 170,
          });

        doc
          .fillColor('#64748b')
          .fontSize(8)
          .font('Helvetica')
          .text('HABITACIÓN:', rightCardX + 14, cardsY + 84);

        doc
          .fillColor('#0f172a')
          .fontSize(9)
          .font('Helvetica-Bold')
          .text(data.roomTypeName, rightCardX + 75, cardsY + 84, { width: 160 });

        // ==========================================
        // 3. BARRA HORARIA / FECHAS DE ESTADÍA
        // ==========================================
        const datesY = 255;
        const datesHeight = 65;

        doc
          .roundedRect(startX, datesY, pageWidth, datesHeight, 6)
          .fillAndStroke('#f1f5f9', '#cbd5e1');

        // Check-in (Col 1)
        doc
          .fillColor('#64748b')
          .fontSize(8)
          .font('Helvetica-Bold')
          .text('ENTRADA / CHECK-IN', startX + 20, datesY + 12);

        doc
          .fillColor('#0f172a')
          .fontSize(12)
          .font('Helvetica-Bold')
          .text(data.checkInDate, startX + 20, datesY + 26);

        doc
          .fillColor('#4f46e5')
          .fontSize(8.5)
          .font('Helvetica-Bold')
          .text(`A partir de las ${data.checkInTime || '15:00'} hrs`, startX + 20, datesY + 44);

        // Separador 1
        doc
          .moveTo(startX + 175, datesY + 12)
          .lineTo(startX + 175, datesY + 53)
          .lineWidth(0.5)
          .stroke('#cbd5e1');

        // Check-out (Col 2)
        doc
          .fillColor('#64748b')
          .fontSize(8)
          .font('Helvetica-Bold')
          .text('SALIDA / CHECK-OUT', startX + 195, datesY + 12);

        doc
          .fillColor('#0f172a')
          .fontSize(12)
          .font('Helvetica-Bold')
          .text(data.checkOutDate, startX + 195, datesY + 26);

        doc
          .fillColor('#4f46e5')
          .fontSize(8.5)
          .font('Helvetica-Bold')
          .text(`Hasta las ${data.checkOutTime || '11:00'} hrs`, startX + 195, datesY + 44);

        // Separador 2
        doc
          .moveTo(startX + 350, datesY + 12)
          .lineTo(startX + 350, datesY + 53)
          .lineWidth(0.5)
          .stroke('#cbd5e1');

        // Total Noches (Col 3)
        doc
          .fillColor('#64748b')
          .fontSize(8)
          .font('Helvetica-Bold')
          .text('DURACIÓN TOTAL', startX + 370, datesY + 12);

        doc
          .fillColor('#d97706')
          .fontSize(14)
          .font('Helvetica-Bold')
          .text(`${data.nights} Noche(s)`, startX + 370, datesY + 26);

        doc
          .fillColor('#64748b')
          .fontSize(8)
          .font('Helvetica')
          .text('Estadía confirmada', startX + 370, datesY + 44);

        // ==========================================
        // 4. RESUMEN FINANCIERO Y CÓDIGO QR RECEPTIVO
        // ==========================================
        const lowerY = 335;
        const financeWidth = 310;
        const qrBoxWidth = 190;
        const lowerHeight = 175;

        // Tarjeta Financiera (Izquierda)
        doc
          .roundedRect(startX, lowerY, financeWidth, lowerHeight, 6)
          .fillAndStroke('#f8fafc', '#e2e8f0');

        doc
          .fillColor('#0f172a')
          .fontSize(10)
          .font('Helvetica-Bold')
          .text('💳 RESUMEN DE PAGO Y FACTURACIÓN', startX + 14, lowerY + 14);

        // Línea divisoria
        doc
          .moveTo(startX + 14, lowerY + 30)
          .lineTo(startX + financeWidth - 14, lowerY + 30)
          .lineWidth(0.5)
          .stroke('#e2e8f0');

        doc
          .fillColor('#64748b')
          .fontSize(9)
          .font('Helvetica')
          .text('Subtotal Hospedaje:', startX + 14, lowerY + 40);

        const currency = data.currency || 'USD';
        doc
          .fillColor('#0f172a')
          .fontSize(9)
          .font('Helvetica')
          .text(`${currency} $${(data.totalAmount * 0.84).toFixed(2)}`, startX + 210, lowerY + 40, {
            width: 85,
            align: 'right',
          });

        doc
          .fillColor('#64748b')
          .fontSize(9)
          .font('Helvetica')
          .text('Impuestos y Tasas (16% IVA):', startX + 14, lowerY + 58);

        doc
          .fillColor('#0f172a')
          .fontSize(9)
          .font('Helvetica')
          .text(`${currency} $${(data.totalAmount * 0.16).toFixed(2)}`, startX + 210, lowerY + 58, {
            width: 85,
            align: 'right',
          });

        doc
          .fillColor('#64748b')
          .fontSize(9)
          .font('Helvetica')
          .text('Método de Pago:', startX + 14, lowerY + 76);

        doc
          .fillColor('#0f172a')
          .fontSize(9)
          .font('Helvetica-Bold')
          .text(data.paymentMethod || 'Tarjeta Crédito / Débito', startX + 150, lowerY + 76, {
            width: 145,
            align: 'right',
          });

        doc
          .fillColor('#64748b')
          .fontSize(9)
          .font('Helvetica')
          .text('Referencia Transacción:', startX + 14, lowerY + 94);

        doc
          .fillColor('#0f172a')
          .fontSize(8)
          .font('Helvetica-Bold')
          .text(data.paymentId || 'TXN-CONFIRMED', startX + 130, lowerY + 94, {
            width: 165,
            align: 'right',
          });

        // Total Destacado
        doc
          .roundedRect(startX + 14, lowerY + 115, financeWidth - 28, 42, 4)
          .fill('#1e1b4b');

        doc
          .fillColor('#c7d2fe')
          .fontSize(9)
          .font('Helvetica-Bold')
          .text('TOTAL COBRADO Y LIQUIDADO:', startX + 24, lowerY + 130);

        doc
          .fillColor('#fbbf24')
          .fontSize(14)
          .font('Helvetica-Bold')
          .text(`${currency} $${Number(data.totalAmount).toFixed(2)}`, startX + 170, lowerY + 128, {
            width: 120,
            align: 'right',
          });

        // Tarjeta QR Code (Derecha)
        const qrX = startX + financeWidth + 15;
        doc
          .roundedRect(qrX, lowerY, qrBoxWidth, lowerHeight, 6)
          .fillAndStroke('#ffffff', '#cbd5e1');

        doc
          .fillColor('#0f172a')
          .fontSize(9.5)
          .font('Helvetica-Bold')
          .text('FAST CHECK-IN CON QR', qrX + 10, lowerY + 12, {
            width: qrBoxWidth - 20,
            align: 'center',
          });

        // Dibujar el código QR
        doc.image(qrBuffer, qrX + 35, lowerY + 28, {
          width: 120,
          height: 120,
        });

        doc
          .fillColor('#64748b')
          .fontSize(7.5)
          .font('Helvetica')
          .text('Muestre este código en recepción para lectura directa', qrX + 10, lowerY + 153, {
            width: qrBoxWidth - 20,
            align: 'center',
          });

        // ==========================================
        // 5. POLÍTICAS DE RECEPCIÓN Y REGLAS DE LA ESTADÍA
        // ==========================================
        const policyY = 525;
        doc
          .roundedRect(startX, policyY, pageWidth, 90, 6)
          .fillAndStroke('#f8fafc', '#e2e8f0');

        doc
          .fillColor('#0f172a')
          .fontSize(9)
          .font('Helvetica-Bold')
          .text('📋 POLÍTICAS IMPORTANTES Y PROCEDIMIENTO DE LLEGADA', startX + 14, policyY + 10);

        doc
          .fillColor('#475569')
          .fontSize(7.5)
          .font('Helvetica')
          .text(
            '• Check-in a partir de las 15:00 hrs. En caso de llegada temprana, el hotel podrá resguardar su equipaje sin costo adicional.\n' +
              '• Cada huésped adulto debe exhibir un documento de identificación oficial (DNI o Pasaporte) vigente en recepción.\n' +
              '• Se puede solicitar un depósito o pre-autorización con tarjeta en el check-in para consumos incidentales, reembolsable a la salida.\n' +
              '• Check-out máximo a las 11:00 hrs. Salidas posteriores sujetas a disponibilidad y cargos aplicables según tarifas del hotel.\n' +
              '• Cancelaciones y reembolsos se rigen por la tarifa seleccionada. Asistencia 24/7 en reservas@travel-resorts.com',
            startX + 14,
            policyY + 26,
            { width: pageWidth - 28, lineGap: 2 },
          );

        // ==========================================
        // 6. PIE DE PÁGINA INSTITUCIONAL
        // ==========================================
        const footerY = 770;
        doc
          .moveTo(startX, footerY)
          .lineTo(startX + pageWidth, footerY)
          .lineWidth(0.5)
          .stroke('#cbd5e1');

        doc
          .fillColor('#64748b')
          .fontSize(8)
          .font('Helvetica')
          .text('Travel & Resorts Cloud Ecosystem • Microservicio de Notificaciones & Emisión de Vouchers', startX, footerY + 8);

        doc
          .fillColor('#94a3b8')
          .fontSize(7.5)
          .font('Helvetica')
          .text(
            `Generado: ${new Date().toLocaleString()} | ID Reserva: ${data.bookingId} | Página 1 de 1`,
            startX,
            footerY + 20,
          );

        doc.end();
      } catch (err) {
        this.logger.error(`Error generando el documento PDF: ${err.message}`, err.stack);
        reject(err);
      }
    });
  }
}

