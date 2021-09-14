/// <reference types="@sveltejs/kit" />

//  Vite ImportMeta https://github.com/vitejs/vite/blob/3a27fa376ea14ba31c8aa13166512b77218e2d9f/packages/vite/types/importMeta.d.ts
declare interface ImportMeta {
	url: string;

	readonly hot?: {
		readonly data: any;

		accept(): void;
		accept(cb: (mod: any) => void): void;
		accept(dep: string, cb: (mod: any) => void): void;
		accept(deps: readonly string[], cb: (mods: any[]) => void): void;

		/**
		 * @deprecated
		 */
		acceptDeps(): never;

		dispose(cb: (data: any) => void): void;
		decline(): void;
		invalidate(): void;

		on(event: string, cb: (...args: any[]) => void): void;
	};

	readonly env: ImportMetaEnv;
}

declare interface ImportMetaEnv {
	[key: string]: string | boolean | undefined;
	BASE_URL: string;
	MODE: string;
	DEV: boolean;
	PROD: boolean;
}
