import { Router } from "express";
import { authenticate } from "@middleware/auth.middleware";
import * as addressController from "@controllers/address.controller";

const router = Router();

router.use(authenticate);

/**
 * @openapi
 * /addresses/:
 *   get:
 *     tags: [Addresses]
 *     summary: List my addresses
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { $ref: '#/components/responses/Success' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *   post:
 *     tags: [Addresses]
 *     summary: Add an address
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/CreateAddressInput' }
 *     responses:
 *       201: { description: "Created (first address becomes the default automatically)" }
 *       400: { $ref: '#/components/responses/ValidationError' }
 *       409: { description: "Duplicate address, or the 5-address limit is reached" }
 */
router.get("/", addressController.getAddresses);
router.post("/", addressController.createAddress);

/**
 * @openapi
 * /addresses/{addressId}:
 *   get:
 *     tags: [Addresses]
 *     summary: Get one of my addresses
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: addressId, required: true, schema: { type: string, format: uuid } }
 *     responses:
 *       200: { $ref: '#/components/responses/Success' }
 *       404: { $ref: '#/components/responses/NotFound' }
 *   put:
 *     tags: [Addresses]
 *     summary: Update an address
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: addressId, required: true, schema: { type: string, format: uuid } }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/CreateAddressInput' }
 *     responses:
 *       200: { $ref: '#/components/responses/Success' }
 *       404: { $ref: '#/components/responses/NotFound' }
 *   delete:
 *     tags: [Addresses]
 *     summary: Delete an address (deleting the default promotes another)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: addressId, required: true, schema: { type: string, format: uuid } }
 *     responses:
 *       200: { $ref: '#/components/responses/Success' }
 *       404: { $ref: '#/components/responses/NotFound' }
 *       409: { description: "Address is used by an order and cannot be deleted" }
 */
router.get("/:addressId", addressController.getAddressById);
router.put("/:addressId", addressController.updateAddress);
router.delete("/:addressId", addressController.deleteAddress);

/**
 * @openapi
 * /addresses/{addressId}/default:
 *   patch:
 *     tags: [Addresses]
 *     summary: Set an address as default
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: addressId, required: true, schema: { type: string, format: uuid } }
 *     responses:
 *       200: { $ref: '#/components/responses/Success' }
 *       404: { $ref: '#/components/responses/NotFound' }
 */
router.patch("/:addressId/default", addressController.setDefaultAddress);

export { router as addressRouter };
