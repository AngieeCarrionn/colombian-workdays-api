export interface BusinessDateRequestDTO {
days?: number;
hours?: number;
date?: string; // ISO 8601 UTC with Z
}


export interface BusinessDateResponseDTO {
date: string; // ISO 8601 UTC with Z
}