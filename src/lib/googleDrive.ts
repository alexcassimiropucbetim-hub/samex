import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { google } from 'googleapis';
import { getConfig } from '@/actions/config-actions';
import { prisma } from '@/lib/prisma';
import { Readable } from 'stream';

export async function uploadTestResultToDrive(candidateId: string, isApproved: boolean) {
  // 1. Fetch credentials from config
  const folderId = await getConfig('google_drive_folder_id');
  const serviceAccountJson = await getConfig('google_drive_service_account');

  if (!folderId || !serviceAccountJson) {
    console.warn("Backup Google Drive ignorado: Configurações ausentes.");
    return;
  }

  try {
    // Buscar dados do candidato
    const candidateData = await prisma.preEvaluation.findUnique({
      where: { id: candidateId },
      include: {
        church: true,
        instrument: true,
        testType: true,
        testSchedule: { include: { church: true } },
        testEvaluator: { include: { roleType: true } }
      }
    });

    if (!candidateData) {
      console.error("Candidato não encontrado para o backup.");
      return;
    }

    const credentials = JSON.parse(serviceAccountJson);
    
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/drive.file'],
    });

    const drive = google.drive({ version: 'v3', auth });

    // 2. Generate PDF
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595, 842]); // A4 Size
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    
    const { height } = page.getSize();
    const margin = 50;
    let currentY = height - margin;

    const drawText = (text: string, fontType = font, size = 12, color = rgb(0,0,0)) => {
      // Remover caracteres especiais e acentos se a fonte não suportar (opcional, Helvetica nativa tem restrições, mas pdf-lib lida se usarmos fontes customizadas. Vamos substituir para evitar erro de encoding no PDF-lib nativo se necessário, mas primeiro tentaremos normal).
      const safeText = text.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      page.drawText(safeText, { x: margin, y: currentY, size, font: fontType, color });
      currentY -= (size + 10);
    };

    drawText("RESULTADO DO TESTE MUSICAL", boldFont, 18);
    currentY -= 20;

    const testDate = candidateData.testSchedule?.testDate 
      ? new Date(candidateData.testSchedule.testDate).toLocaleDateString('pt-BR') 
      : new Date().toLocaleDateString('pt-BR');

    const testLocality = candidateData.testSchedule?.church?.name || candidateData.church?.name || '';
    const evaluatorName = candidateData.testEvaluator?.fullName || '';

    drawText(`Data: ${testDate}`);
    drawText(`Candidato(a): ${candidateData.candidateName}`);
    drawText(`Localidade Teste: ${testLocality}`);
    drawText(`Instrumento: ${candidateData.instrument?.name || ''}`);
    drawText(`Tipo de Teste: ${candidateData.testType?.name || ''}`);
    drawText(`Examinador: ${evaluatorName}`);
    
    currentY -= 30;
    
    const statusText = isApproved ? "APROVADO(A)" : "REPROVADO(A)";
    const statusColor = isApproved ? rgb(0, 0.5, 0) : rgb(0.8, 0, 0);
    
    drawText(`Resultado Final: ${statusText}`, boldFont, 16, statusColor);

    const pdfBytes = await pdfDoc.save();

    // 3. Upload to Drive
    const fileName = `Resultado_${candidateData.candidateName.replace(/\s+/g, '_')}_${Date.now()}.pdf`;

    const fileMetadata = {
      name: fileName,
      parents: [folderId],
    };

    const media = {
      mimeType: 'application/pdf',
      body: Readable.from(Buffer.from(pdfBytes)),
    };

    const response = await drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: 'id',
    });

    console.log("Arquivo salvo no Google Drive com sucesso! ID:", response.data.id);
    return response.data.id;
  } catch (error) {
    console.error("Erro ao fazer upload para o Google Drive:", error);
    // Não lançamos o erro para não quebrar o fluxo principal da aplicação
  }
}
