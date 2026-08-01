import { Request, Response } from 'express';
import prisma from '../../utils/prisma';

export const getCart = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    let cart: any = await prisma.cart.findUnique({
      where: { userId },
      include: {
        user: { include: { company: true } },
        items: {
          include: {
            variant: {
              include: { product: { include: { images: true } }, images: true }
            }
          }
        }
      }
    });

    if (cart && cart.user?.companyId) {
      const contracts = await prisma.companyContract.findMany({
        where: { companyId: cart.user.companyId, isActive: true }
      });
      if (contracts.length > 0) {
        cart.items = cart.items.map((item: any) => {
          const contract = contracts.find(c => c.productId === item.variant.productId);
          if (contract) {
            item.variant.price = contract.customPrice;
            item.variant.product.basePrice = contract.customPrice;
            item.isContractPrice = true;
          }
          return item;
        });
      }
    }

    res.json({ success: true, data: cart });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const addItem = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { variantId, productId, quantity } = req.body;
    const reqQty = parseInt(quantity) || 1;

    let targetVariantId = variantId ? parseInt(variantId) : null;

    // If no variantId is provided, look for the first variant of the product
    if (!targetVariantId && productId) {
      const firstVariant = await prisma.productVariant.findFirst({
        where: { productId: parseInt(productId) }
      });
      if (!firstVariant) {
        return res.status(400).json({ success: false, message: 'This product has no active variants' });
      }
      targetVariantId = firstVariant.id;
    }

    if (!targetVariantId) {
      return res.status(400).json({ success: false, message: 'variantId or productId is required' });
    }

    // Retrieve product & variant details to run MOQ/stock validation
    const variant = await prisma.productVariant.findUnique({
      where: { id: targetVariantId },
      include: { product: true }
    });

    if (!variant) {
      return res.status(404).json({ success: false, message: 'Product variant not found' });
    }

    const product = variant.product;

    // 1. Stock Status Validation
    if (product.stockStatus === 'OUT_OF_STOCK') {
      return res.status(400).json({ success: false, message: 'This item is currently out of stock' });
    }

    // 2. Minimum Order Quantity (MOQ) Validation
    if (reqQty < product.moq) {
      return res.status(400).json({
        success: false,
        message: `Minimum order quantity for this item is ${product.moq} units`
      });
    }

    // 3. Variant Stock Quantity Validation
    if (variant.stockQty < reqQty) {
      return res.status(400).json({
        success: false,
        message: `Only ${variant.stockQty} units available in stock`
      });
    }

    let cart = await prisma.cart.findUnique({ where: { userId } });
    if (!cart) {
      cart = await prisma.cart.create({ data: { userId } });
    }

    const existingItem = await prisma.cartItem.findFirst({
      where: { cartId: cart.id, variantId: targetVariantId }
    });

    const newQty = existingItem ? existingItem.quantity + reqQty : reqQty;

    // Re-verify combined stock limits
    if (variant.stockQty < newQty) {
      return res.status(400).json({
        success: false,
        message: `Cannot add more units. Total quantity in cart would exceed available stock of ${variant.stockQty} units.`
      });
    }

    if (existingItem) {
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newQty }
      });
    } else {
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          variantId: targetVariantId,
          quantity: newQty
        }
      });
    }

    res.json({ success: true, message: 'Item added to cart successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateItem = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;
    const reqQty = parseInt(quantity);

    if (isNaN(reqQty) || reqQty < 1) {
      return res.status(400).json({ success: false, message: 'Invalid quantity' });
    }

    const cartItem = await prisma.cartItem.findUnique({
      where: { id: parseInt(id) },
      include: {
        variant: { include: { product: true } }
      }
    });

    if (!cartItem) {
      return res.status(404).json({ success: false, message: 'Cart item not found' });
    }

    const variant = cartItem.variant;
    const product = variant.product;

    // 1. MOQ Validation
    if (reqQty < product.moq) {
      return res.status(400).json({
        success: false,
        message: `Minimum order quantity for this item is ${product.moq} units`
      });
    }

    // 2. Stock limits
    if (variant.stockQty < reqQty) {
      return res.status(400).json({
        success: false,
        message: `Only ${variant.stockQty} units available in stock`
      });
    }

    await prisma.cartItem.update({
      where: { id: parseInt(id) },
      data: { quantity: reqQty }
    });

    res.json({ success: true, message: 'Cart updated successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const removeItem = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.cartItem.delete({
      where: { id: parseInt(id) }
    });
    res.json({ success: true, message: 'Item removed from cart' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const syncCart = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { items } = req.body; // array of guest cart items

    if (!items || !Array.isArray(items)) {
      return res.status(400).json({ success: false, message: 'Invalid items array' });
    }

    let cart = await prisma.cart.findUnique({ where: { userId } });
    if (!cart) {
      cart = await prisma.cart.create({ data: { userId } });
    }

    for (const item of items) {
      if (!item.variant || !item.variant.id) continue;
      const variantId = item.variant.id;
      const quantity = item.quantity || 1;

      const existingItem = await prisma.cartItem.findFirst({
        where: { cartId: cart.id, variantId: parseInt(variantId) }
      });

      if (existingItem) {
        await prisma.cartItem.update({
          where: { id: existingItem.id },
          data: { quantity: existingItem.quantity + quantity }
        });
      } else {
        await prisma.cartItem.create({
          data: {
            cartId: cart.id,
            variantId: parseInt(variantId),
            quantity
          }
        });
      }
    }

    res.json({ success: true, message: 'Cart synced successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};


