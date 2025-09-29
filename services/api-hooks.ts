import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    createItem,
    getItem,
    getItems,
    getUserProfile,
    getCurrentUser,
    updateProfile,
    searchRegistry,
    RegistrySearchPayload,
    getItemsAnalytics,
    initiatePayment,
    verifyPayment,
    updateItem,
    deleteItem,
    getCredits,
} from "./api";

export const QUERY_KEYS = {
    getCurrentUser: 'getCurrentUser',
    getUserProfile: 'getUserProfile',
    getItems: 'getItems',
    getItem: 'getItem',
    createItem: 'createItem',
    updateProfile: 'updateProfile',
    searchRegistry: 'searchRegistry',
    getItemsAnalytics: 'getItemsAnalytics',
    initiatePayment: 'initiatePayment',
    verifyPayment: 'verifyPayment',
    updateItem: 'updateItem',
    deleteItem: 'deleteItem',
    getCredits: 'getCredits',
} as const

export const useGetCurrentUser = () => {
    return useQuery({
        queryKey: [QUERY_KEYS.getCurrentUser],
        queryFn: getCurrentUser
    })
}

export const useGetUserProfile = () => {
    return useQuery({
        queryKey: [QUERY_KEYS.getUserProfile],
        queryFn: getUserProfile,
        staleTime: 1000 * 60 * 5,
    })
}

export const useUpdateProfile = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationKey: [QUERY_KEYS.updateProfile],
        mutationFn: updateProfile,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.getUserProfile] })
        }
    })
}

export const useGetItems = (params: {
    limit?: number,
    offset?: number,
    status?: string,
    query?: string
}) => {
    return useQuery({
        queryKey: [QUERY_KEYS.getItems, params],
        queryFn: () => getItems(params)
    })
}

export const useInfiniteItems = (pageSize = 20, filters?: { status?: string; query?: string }) => {
    return useInfiniteQuery({
        queryKey: [QUERY_KEYS.getItems, { pageSize, ...filters }],
        queryFn: ({ pageParam = 0 }) =>
            getItems({ limit: pageSize, offset: pageParam, ...filters }),
        initialPageParam: 0,
        getNextPageParam: (lastPage, allPages) => {
            const fetched = allPages.reduce((acc, p) => acc + (p.data?.length || 0), 0);
            const total = lastPage.count ?? 0;
            return fetched < total ? fetched : undefined;
        }
    });
}

export const useGetItem = (id: string) => {
    return useQuery({
        queryKey: [QUERY_KEYS.getItem, id],
        queryFn: () => getItem(id)
    })
}

export const useCreateItem = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationKey: [QUERY_KEYS.createItem],
        mutationFn: createItem,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.getItems] })
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.getItemsAnalytics] })
        }
    })
}

export const useUpdateItem = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationKey: [QUERY_KEYS.updateItem],
        mutationFn: ({ id, data }: { id: string; data: Parameters<typeof updateItem>[1] }) => updateItem(id, data),
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.getItem, variables.id] });
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.getItems] });
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.getItemsAnalytics] });
        }
    });
}

export const useDeleteItem = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationKey: [QUERY_KEYS.deleteItem],
        mutationFn: (id: string) => deleteItem(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.getItems] });
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.getItemsAnalytics] });
        }
    });
}

export const useSearchRegistry = () => {
    return useMutation({
        mutationKey: [QUERY_KEYS.searchRegistry],
        mutationFn: (params: RegistrySearchPayload) => searchRegistry(params)
    })
}

export const useGetItemsAnalytics = () => {
    return useQuery({
        queryKey: [QUERY_KEYS.getItemsAnalytics],
        queryFn: getItemsAnalytics,
    })
}

export const useInitiatePayment = () => {
    return useMutation({
        mutationKey: [QUERY_KEYS.initiatePayment],
        mutationFn: (email: string) => initiatePayment(email),
    })
}

export const useVerifyPayment = () => {
    return useMutation({
        mutationKey: [QUERY_KEYS.verifyPayment],
        mutationFn: (reference: string) => verifyPayment(reference),
    })
}

export const useGetCredits = () => {
    return useQuery({
        queryKey: [QUERY_KEYS.getCredits],
        queryFn: getCredits,
        staleTime: 30_000, // 30s is fine; credits rarely change frequently
    })
}