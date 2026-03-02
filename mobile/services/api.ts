// ============================================
// AI Recipe Mobile — Base API Client
// ============================================

import { STRAPI_URL, STRAPI_API_TOKEN } from '../constants/config';

interface RequestOptions {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
    body?: Record<string, unknown>;
    headers?: Record<string, string>;
}

class ApiClient {
    private baseUrl: string;
    private token: string;

    constructor() {
        this.baseUrl = STRAPI_URL;
        this.token = STRAPI_API_TOKEN;
    }

    private getHeaders(extra?: Record<string, string>): Record<string, string> {
        return {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.token}`,
            ...extra,
        };
    }

    async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
        const { method = 'GET', body, headers } = options;

        const url = `${this.baseUrl}${endpoint}`;
        const config: RequestInit = {
            method,
            headers: this.getHeaders(headers),
        };

        if (body && method !== 'GET') {
            config.body = JSON.stringify(body);
        }

        const response = await fetch(url, config);

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`API Error [${method} ${endpoint}]:`, errorText);
            throw new Error(`API request failed: ${response.status}`);
        }

        return response.json();
    }

    // Convenience methods
    get<T>(endpoint: string) {
        return this.request<T>(endpoint);
    }

    post<T>(endpoint: string, body: Record<string, unknown>) {
        return this.request<T>(endpoint, { method: 'POST', body });
    }

    put<T>(endpoint: string, body: Record<string, unknown>) {
        return this.request<T>(endpoint, { method: 'PUT', body });
    }

    delete<T>(endpoint: string) {
        return this.request<T>(endpoint, { method: 'DELETE' });
    }
}

// Singleton instance
export const api = new ApiClient();
