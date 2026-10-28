'use server';

import { revalidatePath } from 'next/cache';
import { supabase } from '@/lib/supabase';
import { Category, Brand } from '@/store/brandCategoryStore';

export interface ActionResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

// ==============================================================================
// CATEGORY ACTIONS
// ==============================================================================

export async function getCategoriesAction(): Promise<ActionResponse<Category[]>> {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('name', { ascending: true });

    if (error) throw error;
    return { success: true, data: (data as Category[]) || [] };
  } catch (err: any) {
    console.error('Server Action getCategoriesAction error:', err);
    return { success: false, error: err.message || 'Failed to fetch categories' };
  }
}

export async function createCategoryAction(payload: {
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
  is_active?: boolean;
  sort_order?: number;
}): Promise<ActionResponse<Category>> {
  try {
    if (!payload.name?.trim()) {
      return { success: false, error: 'Category name is required' };
    }
    const cleanSlug = (payload.slug || payload.name)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    const { data, error } = await supabase
      .from('categories')
      .insert([{
        name: payload.name.trim(),
        slug: cleanSlug,
        description: payload.description?.trim() || null,
        image_url: payload.image_url?.trim() || null,
        is_active: payload.is_active ?? true,
        sort_order: payload.sort_order || 0,
      }])
      .select()
      .single();

    if (error) throw error;

    revalidatePath('/admin');
    revalidatePath('/');
    return { success: true, data: data as Category };
  } catch (err: any) {
    console.error('Server Action createCategoryAction error:', err);
    return { success: false, error: err.message || 'Failed to create category' };
  }
}

export async function updateCategoryAction(
  id: string,
  payload: Partial<Category>
): Promise<ActionResponse<Category>> {
  try {
    const updates: Record<string, any> = {};
    if (payload.name !== undefined) updates.name = payload.name.trim();
    if (payload.slug !== undefined) {
      updates.slug = payload.slug.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    }
    if (payload.description !== undefined) updates.description = payload.description.trim() || null;
    if (payload.image_url !== undefined) updates.image_url = payload.image_url.trim() || null;
    if (payload.is_active !== undefined) updates.is_active = payload.is_active;
    if (payload.sort_order !== undefined) updates.sort_order = payload.sort_order;

    const { data, error } = await supabase
      .from('categories')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    revalidatePath('/admin');
    revalidatePath('/');
    return { success: true, data: data as Category };
  } catch (err: any) {
    console.error('Server Action updateCategoryAction error:', err);
    return { success: false, error: err.message || 'Failed to update category' };
  }
}

export async function deleteCategoryAction(id: string): Promise<ActionResponse> {
  try {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);

    if (error) throw error;

    revalidatePath('/admin');
    revalidatePath('/');
    return { success: true };
  } catch (err: any) {
    console.error('Server Action deleteCategoryAction error:', err);
    return { success: false, error: err.message || 'Failed to delete category' };
  }
}

// ==============================================================================
// BRAND ACTIONS
// ==============================================================================

export async function getBrandsAction(): Promise<ActionResponse<Brand[]>> {
  try {
    const { data, error } = await supabase
      .from('brands')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('name', { ascending: true });

    if (error) throw error;
    return { success: true, data: (data as Brand[]) || [] };
  } catch (err: any) {
    console.error('Server Action getBrandsAction error:', err);
    return { success: false, error: err.message || 'Failed to fetch brands' };
  }
}

export async function createBrandAction(payload: {
  name: string;
  slug: string;
  description?: string;
  logo_url?: string;
  website_url?: string;
  is_active?: boolean;
  sort_order?: number;
}): Promise<ActionResponse<Brand>> {
  try {
    if (!payload.name?.trim()) {
      return { success: false, error: 'Brand name is required' };
    }
    const cleanSlug = (payload.slug || payload.name)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    const { data, error } = await supabase
      .from('brands')
      .insert([{
        name: payload.name.trim(),
        slug: cleanSlug,
        description: payload.description?.trim() || null,
        logo_url: payload.logo_url?.trim() || null,
        website_url: payload.website_url?.trim() || null,
        is_active: payload.is_active ?? true,
        sort_order: payload.sort_order || 0,
      }])
      .select()
      .single();

    if (error) throw error;

    revalidatePath('/admin');
    revalidatePath('/');
    return { success: true, data: data as Brand };
  } catch (err: any) {
    console.error('Server Action createBrandAction error:', err);
    return { success: false, error: err.message || 'Failed to create brand' };
  }
}

export async function updateBrandAction(
  id: string,
  payload: Partial<Brand>
): Promise<ActionResponse<Brand>> {
  try {
    const updates: Record<string, any> = {};
    if (payload.name !== undefined) updates.name = payload.name.trim();
    if (payload.slug !== undefined) {
      updates.slug = payload.slug.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    }
    if (payload.description !== undefined) updates.description = payload.description.trim() || null;
    if (payload.logo_url !== undefined) updates.logo_url = payload.logo_url.trim() || null;
    if (payload.website_url !== undefined) updates.website_url = payload.website_url.trim() || null;
    if (payload.is_active !== undefined) updates.is_active = payload.is_active;
    if (payload.sort_order !== undefined) updates.sort_order = payload.sort_order;

    const { data, error } = await supabase
      .from('brands')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    revalidatePath('/admin');
    revalidatePath('/');
    return { success: true, data: data as Brand };
  } catch (err: any) {
    console.error('Server Action updateBrandAction error:', err);
    return { success: false, error: err.message || 'Failed to update brand' };
  }
}

export async function deleteBrandAction(id: string): Promise<ActionResponse> {
  try {
    const { error } = await supabase
      .from('brands')
      .delete()
      .eq('id', id);

    if (error) throw error;

    revalidatePath('/admin');
    revalidatePath('/');
    return { success: true };
  } catch (err: any) {
    console.error('Server Action deleteBrandAction error:', err);
    return { success: false, error: err.message || 'Failed to delete brand' };
  }
}

