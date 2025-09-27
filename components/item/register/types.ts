import type { useThemedColors } from '@/hooks/useThemedColors';
import type { CATEGORIES, STATUSES } from './constants';

export type ImgKind = 'url' | 'file';

export interface Img {
	id: string;
	kind: ImgKind;
	uri: string;
	filename?: string | null;
	base64?: string | null;
}

export interface FormValues {
	name: string;
	serial: string;
	category: (typeof CATEGORIES)[number];
	status: (typeof STATUSES)[number];
	description: string;
	owner: string;
	contact: string;
	images: Img[];
}

export interface UploadResult {
	updatedImages: Img[];
	remoteUrls: string[];
}

export type WizardStep = 0 | 1 | 2 | 3 | 4;

export type ThemedColors = ReturnType<typeof useThemedColors>['colors'];
