import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  return handleDeliveryUpdate(request);
}

export async function PATCH(request: Request) {
  return handleDeliveryUpdate(request);
}

async function handleDeliveryUpdate(request: Request) {
  try {
    const body = await request.json();
    const { productId, isFreeDelivery, customDeliveryCharge } = body;

    if (!productId || typeof productId !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Product ID is required and must be a string.' },
        { status: 400 }
      );
    }

    const freeDelivery = Boolean(isFreeDelivery);
    const deliveryCharge = freeDelivery 
      ? 0 
      : (customDeliveryCharge !== undefined && customDeliveryCharge !== null && !isNaN(Number(customDeliveryCharge))
          ? Number(customDeliveryCharge) 
          : null);

    const updatePayload: { is_free_delivery: boolean; custom_delivery_charge: number | null } = {
      is_free_delivery: freeDelivery,
      custom_delivery_charge: deliveryCharge,
    };

    const { data, error } = await supabase
      .from('products')
      .update(updatePayload)
      .eq('id', productId)
      .select('id, name, is_free_delivery, custom_delivery_charge')
      .single();

    if (error) {
      console.error('Supabase error updating delivery settings:', error);
      return NextResponse.json(
        { success: false, error: error.message || 'Failed to update delivery settings in database.' },
        { status: 500 }
      );
    }

    // Revalidate storefront and checkout caches
    try {
      revalidatePath('/', 'page');
      revalidatePath('/checkout', 'page');
      revalidatePath('/cart', 'page');
      revalidatePath(`/product/${productId}`, 'page');
    } catch (cacheErr) {
      console.warn('Revalidation warning:', cacheErr);
    }

    return NextResponse.json({
      success: true,
      message: 'Product delivery settings updated successfully.',
      product: {
        id: data?.id,
        name: data?.name,
        isFreeDelivery: Boolean(data?.is_free_delivery),
        customDeliveryCharge: data?.custom_delivery_charge !== null ? Number(data?.custom_delivery_charge) : null,
      },
    });
  } catch (err: any) {
    console.error('Unhandled API error in /api/admin/products/delivery:', err);
    return NextResponse.json(
      { success: false, error: err?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');

    if (productId) {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, is_free_delivery, custom_delivery_charge')
        .eq('id', productId)
        .single();

      if (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 404 });
      }

      return NextResponse.json({
        success: true,
        product: {
          id: data.id,
          name: data.name,
          isFreeDelivery: Boolean(data.is_free_delivery),
          customDeliveryCharge: data.custom_delivery_charge !== null ? Number(data.custom_delivery_charge) : null,
        },
      });
    }

    // Return all products with their delivery configurations
    const { data, error } = await supabase
      .from('products')
      .select('id, name, price, regular_price, image, is_free_delivery, custom_delivery_charge, category');

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    const formatted = (data || []).map(p => ({
      id: p.id,
      name: p.name,
      price: p.price,
      image: p.image,
      category: p.category,
      isFreeDelivery: Boolean(p.is_free_delivery),
      customDeliveryCharge: p.custom_delivery_charge !== null ? Number(p.custom_delivery_charge) : null,
    }));

    return NextResponse.json({ success: true, count: formatted.length, products: formatted });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || 'Internal server error' }, { status: 500 });
  }
}
