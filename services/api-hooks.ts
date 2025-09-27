import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
        }
    })
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
        staleTime: 1000 * 60 * 2,
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