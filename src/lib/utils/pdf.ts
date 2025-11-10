import { browser } from '$app/environment';

type Html2PdfFactory = typeof import('html2pdf.js')['default'];

let html2pdfFactory: Html2PdfFactory | null = null;

const ensureLib = async () => {
	if (html2pdfFactory) return html2pdfFactory;
	const mod = await import('html2pdf.js');
	html2pdfFactory = (mod.default ?? mod) as Html2PdfFactory;
	return html2pdfFactory;
};

export const exportElementToPdf = async (element: HTMLElement, filename: string) => {
	if (!browser || !element) return;
	const html2pdf = await ensureLib();
	html2pdf()
		.set({
			margin: 10,
			filename,
			image: { type: 'jpeg', quality: 0.95 },
			html2canvas: { scale: 2 },
			jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
		})
		.from(element)
		.save(filename);
};
