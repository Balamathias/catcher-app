import { supabase } from "@/lib/supabase";
import { Tables, Enums } from "@/types/supabase";
import { microservice } from ".";
import { PaginatedResponse, Response } from "@/types/api-generics";

export const getCurrentUser = async () => {
    const { data, error } = await supabase.auth.getUser()
    if (error) {
        throw error
    }

    return { data }
}

export const createItem = async (payload: Record<string, any>): Promise<Response<Tables<'items'>>> => {
    try {
        const { data, status } = await microservice.post('/items/', payload)
        return data
    } catch (error: any) {
        return {
            data: null,
            error: {
                message: error?.response?.data?.message || error?.message
            },
            status: error?.response?.status,
            message: error?.response?.data?.message || error?.message
        }
    }
}

export const getItems = async (params: {
    limit?: number,
    offset?: number,
    status?: string,
    query?: string
}): Promise<PaginatedResponse<Tables<'items'>[]>> => {
    try {
        const { data, status } = await microservice.get('/items/', {
            params
        })
        return data
    } catch (error: any) {
        return {
            data: [],
            error: {
                message: error?.response?.data?.message || error?.message
            },
            status: error?.response?.status,
            message: error?.response?.data?.message || error?.message,
            count: 0,
            next: '',
            previous: ''
        }
    }
}

export const getItem = async (id: string): Promise<Response<Tables<'items'>>> => {
    try {
        const { data, status } = await microservice.get(`/items/${id}/`)
        return data
    } catch (error: any) {
        return {
            data: null,
            error: {
                message: error?.response?.data?.message || error?.message
            },
            status: error?.response?.status,
            message: error?.response?.data?.message || error?.message
        }
    }
}

export const updateProfile = async (profileData: Partial<Tables<'profiles'>>): Promise<Response<Tables<'profiles'> | null>> => {
    try {
        const { data, status } = await microservice.put('/mobile/profile/', profileData)
        return data
    } catch (error: any) {
        console.error('Error updating profile:', error);
        return {
            data: null,
            error: {
                message: error?.response?.data?.message || error?.message
            },
            status: error?.response?.status,
            message: error?.response?.data?.message || error?.message
        }
    }
}

export const getUserProfile = async (): Promise<Response<Tables<'profiles'> | null>> => {
    try {
        const { data, status } = await microservice.get('/mobile/profile/')
        return data
    } catch (error: any) {
        return {
            data: null,
            error: {
                message: error?.response?.data?.message || error?.message
            },
            status: error?.response?.status,
            message: error?.response?.data?.message || error?.message
        }
    }
}

export const updateItem = async (id: string, itemData: Partial<Tables<'items'>>): Promise<Response<Tables<'items'> | null>> => {
    try {
        const { data, status } = await microservice.put(`/items/${id}/`, itemData)
        return data
    } catch (error: any) {
        return {
            data: null,
            error: {
                message: error?.response?.data?.message || error?.message
            },
            status: error?.response?.status,
            message: error?.response?.data?.message || error?.message
        }
    }
}

export const deleteItem = async (id: string): Promise<Response<null>> => {
    try {
        const { data, status } = await microservice.delete(`/items/${id}/`)
        return data
    } catch (error: any) {
        return {
            data: null,
            error: {
                message: error?.response?.data?.message || error?.message
            },
            status: error?.response?.status,
            message: error?.response?.data?.message || error?.message
        }
    }
}

export type RegistrySearchPayload = {
    query: string,
    category?: string,
    status?: Enums<'item_status'>,
    serial_number?: string,
    limit?: number,
    offset?: number,
}

export const searchRegistry = async (payload: RegistrySearchPayload): Promise<PaginatedResponse<Tables<'items'>[]>> => {
    try {
        const { data } = await microservice.post('/registry/search/', payload)
        return data
    } catch (error: any) {
        return {
            data: [],
            error: {
                message: error?.response?.data?.message || error?.message
            },
            status: error?.response?.status,
            message: error?.response?.data?.message || error?.message,
            count: 0,
            next: '',
            previous: '',
        }
    }
}

// Items analytics
export type ItemsAnalytics = {
    totals: { total: number; safe: number; stolen: number; unknown: number };
    ratios: { safe: number; stolen: number; unknown: number };
    last_updated_at: string | null;
    recent: { added_last_30d: number; stolen_last_30d: number };
    top_categories: { category: string; count: number }[];
    recent_items: Pick<Tables<'items'>, 'id' | 'name' | 'status' | 'category' | 'created_at' | 'image_url' | 'serial_number'>[];
}

export const getItemsAnalytics = async (): Promise<Response<ItemsAnalytics>> => {
    try {
        const { data } = await microservice.get('/items/analytics/')
        return data
    } catch (error: any) {
        return {
            data: {
                totals: { total: 0, safe: 0, stolen: 0, unknown: 0 },
                ratios: { safe: 0, stolen: 0, unknown: 0 },
                last_updated_at: null,
                recent: { added_last_30d: 0, stolen_last_30d: 0 },
                top_categories: [],
                recent_items: [],
            },
            error: { message: error?.response?.data?.message || error?.message },
            status: error?.response?.status,
            message: error?.response?.data?.message || error?.message,
        }
    }
}

export const initiatePayment = async (email: string): Promise<Response<{ authorization_url: string; access_code?: string; reference: string; amount: number }>> => {
    try {
        const { data } = await microservice.post('/payments/initiate/', { email })
        return data
    } catch (error: any) {
        return {
            data: null,
            error: { message: error?.response?.data?.message || error?.message },
            status: error?.response?.status,
            message: error?.response?.data?.message || error?.message,
        }
    }
}

export const verifyPayment = async (reference: string): Promise<Response<{ verified: boolean; status: string; amount: number; reference: string }>> => {
    try {
        const { data } = await microservice.get('/payments/verify/', { params: { reference } })
        return data
    } catch (error: any) {
        return {
            data: null,
            error: { message: error?.response?.data?.message || error?.message },
            status: error?.response?.status,
            message: error?.response?.data?.message || error?.message,
        }
    }
}

export const getCredits = async (): Promise<Response<{ available: number }>> => {
    try {
        const { data } = await microservice.get('/payments/credits/')
        return data
    } catch (error: any) {
        return {
            data: { available: 0 },
            error: { message: error?.response?.data?.message || error?.message },
            status: error?.response?.status,
            message: error?.response?.data?.message || error?.message,
        }
    }
}

export const deleteAccount = async (payload?: { reason?: string }): Promise<Response<{ deleted: boolean; user_id: string }>> => {
    try {
        const { data } = await microservice.delete('/account/delete/', { data: payload })
        return data
    } catch (error: any) {
        return {
            data: null,
            error: { message: error?.response?.data?.message || error?.message },
            status: error?.response?.status,
            message: error?.response?.data?.message || error?.message,
        }
    }
}
