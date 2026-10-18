import * as pdfjs from "pdfjs-dist";

// O worker fica em /public (copiado de node_modules/pdfjs-dist/build/pdf.worker.min.mjs)
pdfjs.GlobalWorkerOptions.workerSrc = `${process.env.PUBLIC_URL}/pdf.worker.min.mjs`;

export { pdfjs };
