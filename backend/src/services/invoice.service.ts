import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import * as orderRepo from "@repos/order.repo";
import * as faqRepo from "@repos/faq.repo";
import { Errors } from "@errors/index";
import type { OrderWithRelations } from "@interfaces/order.types";

const PAGE_WIDTH = 595.28; // A4 in points
const PAGE_HEIGHT = 841.89;
const MARGIN = 50;

const money = (n: number): string => `Rs. ${n.toFixed(2)}`;

export const generateInvoicePdf = async (userId: string, orderId: string): Promise<Uint8Array> => {
  const order = await orderRepo.findOrderByIdForUser(orderId, userId);
  if (!order) throw Errors.ORDER_NOT_FOUND();

  // An invoice only makes sense once the order was actually placed — a still-PENDING
  // checkout has no confirmed items/amount to invoice.
  if (order.orderStatus === "PENDING") throw Errors.INVOICE_NOT_AVAILABLE();

  const storeInfo = await faqRepo.findStoreInfo();

  return renderInvoice(order, storeInfo);
};

export const adminGenerateInvoicePdf = async (orderId: string): Promise<Uint8Array> => {
  const order = await orderRepo.findOrderById(orderId);
  if (!order) throw Errors.ORDER_NOT_FOUND();
  if (order.orderStatus === "PENDING") throw Errors.INVOICE_NOT_AVAILABLE();

  const storeInfo = await faqRepo.findStoreInfo();

  return renderInvoice(order, storeInfo);
};

type StoreHeader = {
  storeName: string;
  email: string | null;
  phone: string | null;
  addressLine1: string | null;
  addressLine2: string | null;
  city: string | null;
  state: string | null;
  pincode: string | null;
  country: string;
} | null;

const renderInvoice = async (order: OrderWithRelations, storeInfo: StoreHeader): Promise<Uint8Array> => {
  const doc = await PDFDocument.create();
  const page = doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const boldFont = await doc.embedFont(StandardFonts.HelveticaBold);

  let y = PAGE_HEIGHT - MARGIN;

  const drawText = (
    text: string,
    x: number,
    options: { size?: number; bold?: boolean; color?: ReturnType<typeof rgb> } = {},
  ): void => {
    page.drawText(text, {
      x,
      y,
      size: options.size ?? 10,
      font: options.bold ? boldFont : font,
      color: options.color ?? rgb(0, 0, 0),
    });
  };

  const newLine = (height = 14): void => {
    y -= height;
  };

  // Right-aligns text so its right edge lands at `rightEdge` — used for the totals
  // column so amount widths (and long coupon codes) never collide with the label.
  const drawRightAligned = (text: string, rightEdge: number, options: { size?: number; bold?: boolean } = {}): void => {
    const size = options.size ?? 10;
    const usedFont = options.bold ? boldFont : font;
    const width = usedFont.widthOfTextAtSize(text, size);
    drawText(text, rightEdge - width, options);
  };

  // ── Header ──────────────────────────────────────────────────────────────
  drawText(storeInfo?.storeName ?? "House of Hoops", MARGIN, { size: 18, bold: true });
  drawText("TAX INVOICE", PAGE_WIDTH - MARGIN - 90, { size: 14, bold: true });
  newLine(20);

  if (storeInfo) {
    const addressParts = [storeInfo.addressLine1, storeInfo.addressLine2, storeInfo.city, storeInfo.state, storeInfo.pincode]
      .filter(Boolean)
      .join(", ");
    if (addressParts) {
      drawText(addressParts, MARGIN, { size: 9, color: rgb(0.35, 0.35, 0.35) });
      newLine(12);
    }
    const contactParts = [storeInfo.email, storeInfo.phone].filter(Boolean).join("  |  ");
    if (contactParts) {
      drawText(contactParts, MARGIN, { size: 9, color: rgb(0.35, 0.35, 0.35) });
      newLine(12);
    }
  }

  newLine(16);
  page.drawLine({
    start: { x: MARGIN, y },
    end: { x: PAGE_WIDTH - MARGIN, y },
    thickness: 1,
    color: rgb(0.8, 0.8, 0.8),
  });
  newLine(20);

  // ── Order + customer info ──────────────────────────────────────────────
  drawText(`Invoice for Order #${order.orderId}`, MARGIN, { size: 11, bold: true });
  newLine(16);
  drawText(`Order date: ${order.createdAt.toDateString()}`, MARGIN, { size: 9 });
  newLine(14);
  drawText(`Payment status: ${order.paymentStatus}${order.paymentMethod ? ` (${order.paymentMethod})` : ""}`, MARGIN, {
    size: 9,
  });
  newLine(20);

  drawText("Billed to:", MARGIN, { size: 10, bold: true });
  newLine(14);
  drawText(order.user.fullName ?? order.user.email, MARGIN, { size: 9 });
  newLine(12);
  drawText(order.user.email, MARGIN, { size: 9 });
  newLine(12);
  if (order.user.mobile) {
    drawText(order.user.mobile, MARGIN, { size: 9 });
    newLine(12);
  }

  const addr = order.shippingAddress;
  drawText(
    `${addr.addressLine1}${addr.addressLine2 ? ", " + addr.addressLine2 : ""}, ${addr.city}, ${addr.state} - ${addr.pincode}`,
    MARGIN,
    { size: 9 },
  );
  newLine(24);

  // ── Line items table ────────────────────────────────────────────────────
  const col = { item: MARGIN, size: 280, qty: 340, price: 390, total: 470 };
  drawText("Item", col.item, { size: 9, bold: true });
  drawText("Size/Color", col.size, { size: 9, bold: true });
  drawText("Qty", col.qty, { size: 9, bold: true });
  drawText("Price", col.price, { size: 9, bold: true });
  drawText("Total", col.total, { size: 9, bold: true });
  newLine(6);
  page.drawLine({
    start: { x: MARGIN, y },
    end: { x: PAGE_WIDTH - MARGIN, y },
    thickness: 0.5,
    color: rgb(0.8, 0.8, 0.8),
  });
  newLine(16);

  for (const item of order.orderItems) {
    const lineTotal = item.discountedPrice * item.quantity;
    drawText(item.productTitle.slice(0, 40), col.item, { size: 9 });
    drawText(`${item.size} / ${item.color}`, col.size, { size: 9 });
    drawText(String(item.quantity), col.qty, { size: 9 });
    drawText(money(item.discountedPrice), col.price, { size: 9 });
    drawText(money(lineTotal), col.total, { size: 9 });
    newLine(16);
  }

  newLine(6);
  page.drawLine({
    start: { x: MARGIN, y },
    end: { x: PAGE_WIDTH - MARGIN, y },
    thickness: 0.5,
    color: rgb(0.8, 0.8, 0.8),
  });
  newLine(20);

  // ── Totals ──────────────────────────────────────────────────────────────
  const totalsLabelX = 320;
  const totalsRightEdge = PAGE_WIDTH - MARGIN;

  drawText("Subtotal:", totalsLabelX, { size: 9 });
  drawRightAligned(money(order.totalPrice), totalsRightEdge, { size: 9 });
  newLine(14);

  if (order.discount > 0) {
    drawText("Discount:", totalsLabelX, { size: 9 });
    drawRightAligned(`- ${money(order.discount)}`, totalsRightEdge, { size: 9 });
    newLine(14);
  }

  if (order.couponCode && order.couponDiscount) {
    drawText("Coupon:", totalsLabelX, { size: 9 });
    drawRightAligned(`${order.couponCode} (- ${money(order.couponDiscount)})`, totalsRightEdge, { size: 9 });
    newLine(14);
  }

  drawText("Shipping:", totalsLabelX, { size: 9 });
  drawRightAligned(order.shippingCharge > 0 ? money(order.shippingCharge) : "Free", totalsRightEdge, { size: 9 });
  newLine(16);

  drawText("Total Amount:", totalsLabelX, { size: 11, bold: true });
  drawRightAligned(money(order.totalAmount), totalsRightEdge, { size: 11, bold: true });
  newLine(30);

  drawText("This is a system-generated invoice.", MARGIN, { size: 8, color: rgb(0.5, 0.5, 0.5) });

  return doc.save();
};
