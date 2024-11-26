import { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const PDFViewer = () => {
  const [isMobile, setIsMobile] = useState(false);
  const pdfUrl = 'https://ipmaia-winterjam.pt/Regulamento_Game_Jam.pdf';

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div className="flex flex-col w-full min-h-screen p-4">
      {isMobile && (
        <Alert className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Aviso para Visualização Móvel</AlertTitle>
          <AlertDescription>
            Para uma melhor experiência em dispositivos móveis, recomendamos baixar o PDF.
          </AlertDescription>
        </Alert>
      )}

      <div className="w-full flex-grow">
        {isMobile ? (
          <div className="flex flex-col gap-4">
            <a 
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 underline"
            >
              Abrir PDF em nova aba
            </a>
            <a 
              href={pdfUrl}
              download="Regulamento_Game_Jam.pdf"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-center"
            >
              Baixar PDF
            </a>
          </div>
        ) : (
          <object
            data={pdfUrl}
            type="application/pdf"
            className="w-full h-[calc(100vh-8rem)] rounded-lg shadow-lg"
          >
            <p>
              Seu navegador não suporta visualização de PDF.{' '}
              <a href={pdfUrl} className="text-blue-600 hover:text-blue-800 underline">
                Clique aqui para baixar o PDF
              </a>
            </p>
          </object>
        )}
      </div>
    </div>
  );
};

export default PDFViewer;