import type { Request, Response } from "express";
import { asyncHandler } from "@utils/asyncHandler";
import { sendSuccess } from "@utils/response";
import * as orderService from "@services/order.service";
import {
  cancelOrderSchema,
  updateOrderStatusSchema,
  updatePaymentStatusSchema,
  orderListQuerySchema,
  myOrderListQuerySchema,
  monthlyCountsQuerySchema,
} from "@validators/order.schema";
import type { OrderStatus } from "@interfaces/order.types";

// ─── Customer ─────────────────────────────────────────────────────────────────

export const getUserOrders = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const query = myOrderListQuerySchema.parse(req.query);
  const result = await orderService.getUserOrders(userId, query);
  sendSuccess(res, result);
});

export const getOrderDetail = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const orderId = req.params["orderId"] as string;
  const order = await orderService.getOrderDetail(userId, orderId);
  sendSuccess(res, order);
});

export const cancelOrder = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const orderId = req.params["orderId"] as string;
  const input = cancelOrderSchema.parse(req.body ?? {});
  const order = await orderService.cancelOrder(userId, orderId, input);
  sendSuccess(res, order);
});

// ─── Admin ────────────────────────────────────────────────────────────────────

export const adminGetAllOrders = asyncHandler(async (req: Request, res: Response) => {
  const query = orderListQuerySchema.parse(req.query);
  const result = await orderService.adminGetAllOrders(query);
  sendSuccess(res, result);
});

export const adminGetAllOrdersNoPagination = asyncHandler(async (_req: Request, res: Response) => {
  const orders = await orderService.adminGetAllOrdersNoPagination();
  sendSuccess(res, orders);
});

export const adminGetOrderById = asyncHandler(async (req: Request, res: Response) => {
  const orderId = req.params["orderId"] as string;
  const order = await orderService.adminGetOrderById(orderId);
  sendSuccess(res, order);
});

export const adminGetOrdersByStatus = asyncHandler(async (req: Request, res: Response) => {
  const status = (req.params["status"] as string).toUpperCase() as OrderStatus;
  const orders = await orderService.adminGetOrdersByStatus(status);
  sendSuccess(res, orders);
});

export const adminGetOrdersByUser = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.params["userId"] as string;
  const orders = await orderService.adminGetOrdersByUser(userId);
  sendSuccess(res, orders);
});

export const adminUpdateOrderStatus = asyncHandler(async (req: Request, res: Response) => {
  const orderId = req.params["orderId"] as string;
  const input = updateOrderStatusSchema.parse(req.body);
  const order = await orderService.adminUpdateOrderStatus(orderId, input);
  sendSuccess(res, order);
});

export const adminUpdatePaymentStatus = asyncHandler(async (req: Request, res: Response) => {
  const orderId = req.params["orderId"] as string;
  const input = updatePaymentStatusSchema.parse(req.body);
  const order = await orderService.adminUpdatePaymentStatus(orderId, input);
  sendSuccess(res, order);
});

export const adminDeleteOrder = asyncHandler(async (req: Request, res: Response) => {
  const orderId = req.params["orderId"] as string;
  await orderService.adminDeleteOrder(orderId);
  sendSuccess(res, { message: "Order deleted successfully." });
});

export const adminMarkRefunded = asyncHandler(async (req: Request, res: Response) => {
  const orderId = req.params["orderId"] as string;
  const order = await orderService.adminMarkRefunded(orderId);
  sendSuccess(res, order);
});

export const adminGetOrderStats = asyncHandler(async (_req: Request, res: Response) => {
  const stats = await orderService.adminGetOrderStats();
  sendSuccess(res, stats);
});

export const adminGetMonthlyOrderCounts = asyncHandler(async (req: Request, res: Response) => {
  const query = monthlyCountsQuerySchema.parse(req.query);
  const counts = await orderService.adminGetMonthlyOrderCounts(query);
  sendSuccess(res, counts);
});
