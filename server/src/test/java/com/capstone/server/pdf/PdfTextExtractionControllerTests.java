package com.capstone.server.pdf;

import static org.hamcrest.Matchers.containsString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.io.ByteArrayOutputStream;
import java.io.IOException;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.apache.pdfbox.pdmodel.font.Standard14Fonts;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
class PdfTextExtractionControllerTests {

	@Autowired
	private MockMvc mockMvc;

	@Test
	void extractsTextFromUploadedPdf() throws Exception {
		MockMultipartFile file = new MockMultipartFile(
			"file",
			"sample.pdf",
			"application/pdf",
			createPdf("Hello PDF")
		);

		mockMvc.perform(multipart("/api/pdf/extract").file(file))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.success").value(true))
			.andExpect(jsonPath("$.code").value("OK"))
			.andExpect(jsonPath("$.data.filename").value("sample.pdf"))
			.andExpect(jsonPath("$.data.text").value(containsString("Hello PDF")));
	}

	@Test
	void rejectsNonPdfUploads() throws Exception {
		MockMultipartFile file = new MockMultipartFile(
			"file",
			"sample.txt",
			"text/plain",
			"not a pdf".getBytes()
		);

		mockMvc.perform(multipart("/api/pdf/extract").file(file))
			.andExpect(status().isUnsupportedMediaType())
			.andExpect(jsonPath("$.success").value(false))
			.andExpect(jsonPath("$.code").value("PDF_FILE_TYPE_INVALID"));
	}

	private byte[] createPdf(String text) throws IOException {
		try (
			PDDocument document = new PDDocument();
			ByteArrayOutputStream outputStream = new ByteArrayOutputStream()
		) {
			PDPage page = new PDPage();
			document.addPage(page);

			try (PDPageContentStream contentStream = new PDPageContentStream(document, page)) {
				contentStream.beginText();
				contentStream.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA), 12);
				contentStream.newLineAtOffset(72, 720);
				contentStream.showText(text);
				contentStream.endText();
			}

			document.save(outputStream);
			return outputStream.toByteArray();
		}
	}
}
