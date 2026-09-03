import type { Request, Response } from "express";
import { asyncHandler } from "@utils/asyncHandler";
import * as invoiceService from "@services/invoice.service";

export const downloadInvoice = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const orderId = req.params["orderId"] as string;
  const pdfBytes = await invoiceService.generateInvoicePdf(userId, orderId);

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename="invoice-${orderId}.pdf"`);
  res.send(Buffer.from(pdfBytes));
});

export const adminDownloadInvoice = asyncHandler(async (req: Request, res: Response) => {
  const orderId = req.params["orderId"] as string;
  const pdfBytes = await invoiceService.adminGenerateInvoicePdf(orderId);

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename="invoice-${orderId}.pdf"`);
  res.send(Buffer.from(pdfBytes));
});
