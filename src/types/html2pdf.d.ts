declare module 'html2pdf.js' {
	type Html2PdfOptions = {
		margin?: number | number[];
		filename?: string;
		image?: { type?: string; quality?: number };
		html2canvas?: Record<string, unknown>;
		jsPDF?: Record<string, unknown>;
		pagebreak?: Record<string, unknown>;
	};

	interface Html2PdfInstance {
		from(element: HTMLElement): Html2PdfInstance;
		set(options: Html2PdfOptions): Html2PdfInstance;
		save(filename?: string): Promise<void>;
	}

	type Html2PdfFactory = (() => Html2PdfInstance) & {
		from(element: HTMLElement): Html2PdfInstance;
	};

	const html2pdf: Html2PdfFactory;

	export default html2pdf;
}
