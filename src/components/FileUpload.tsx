import { ChangeEvent } from "react";
import { UploadCloud } from "lucide-react";

interface FileUploadProps {
  onFilesSelected: (files: FileList | null) => void;
}

export function FileUpload({ onFilesSelected }: FileUploadProps) {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    onFilesSelected(e.target.files);
    e.target.value = "";
  };

  return (
    <label className="upload">
      <UploadCloud size={42} />
      <strong>Selecione seus documentos</strong>
      <span>Ou toque aqui para procurar arquivos</span>
      <input
        type="file"
        accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
        multiple
        onChange={handleChange}
      />
    </label>
  );
}