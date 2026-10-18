import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';
import { ExportView } from './components/ExportView';
import { ValidationView } from './components/ValidationView';

test('renders Recife ReaderDoc title', () => {
  render(<App />);
  const titleElement = screen.getByText(/Recife ReaderDoc/i);
  expect(titleElement).toBeInTheDocument();
});

test('renders ExportView with CSV, JSON, and XLSX options matching page 3', () => {
  const onExportCSV = jest.fn();
  const onExportJSON = jest.fn();
  const onExportXLSX = jest.fn();
  const onGoToValidation = jest.fn();
  const onBack = jest.fn();

  render(
    <ExportView
      onBack={onBack}
      onGoToValidation={onGoToValidation}
      onExportCSV={onExportCSV}
      onExportJSON={onExportJSON}
      onExportXLSX={onExportXLSX}
      documentCount={2}
    />
  );

  expect(screen.getByText(/Exportar como:/i)).toBeInTheDocument();
  expect(screen.getByText('CSV')).toBeInTheDocument();
  expect(screen.getByText('JSON')).toBeInTheDocument();
  expect(screen.getByText('XLSX')).toBeInTheDocument();
  expect(screen.getByText(/Validar documentos/i)).toBeInTheDocument();

  fireEvent.click(screen.getByText('CSV'));
  expect(onExportCSV).toHaveBeenCalledTimes(1);

  fireEvent.click(screen.getByText(/Validar documentos/i));
  expect(onGoToValidation).toHaveBeenCalledTimes(1);
});

test('renders ValidationView with valid and invalid badges matching page 4', () => {
  const mockDocs = [
    {
      id: '1',
      nome: 'Ficheiro 1',
      arquivo: new File(['fake content'], 'ficheiro1.pdf', { type: 'application/pdf' }),
      status: 'PDF pronto',
      validacao: { valido: true },
    },
    {
      id: '2',
      nome: 'Ficheiro 2',
      arquivo: new File(['fake content'], 'ficheiro2.pdf', { type: 'application/pdf' }),
      status: 'PDF pronto',
      validacao: { valido: true },
    },
    {
      id: '3',
      nome: 'Ficheiro 3',
      arquivo: new File([''], 'ficheiro3.txt', { type: 'text/plain' }),
      status: 'Formato não suportado',
      validacao: { valido: false, motivo: 'Documento inválido, informações incorretas' },
    },
  ];

  render(
    <ValidationView
      documentos={mockDocs}
      validando={false}
      onValidate={jest.fn()}
      onBack={jest.fn()}
    />
  );

  expect(screen.getByText('Ficheiro 1')).toBeInTheDocument();
  expect(screen.getByText('Ficheiro 2')).toBeInTheDocument();
  expect(screen.getByText('Ficheiro 3')).toBeInTheDocument();
  expect(screen.getByText(/Documento inválido, informações incorretas/i)).toBeInTheDocument();
});
