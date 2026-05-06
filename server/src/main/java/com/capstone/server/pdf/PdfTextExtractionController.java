package com.capstone.server.pdf;

import java.io.IOException;

import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.capstone.server.common.api.ApiException;
import com.capstone.server.common.api.ApiResponse;

@RestController
@RequestMapping("/api/pdf")
@CrossOrigin(origins = {"http://localhost:5173", "http://127.0.0.1:5173"})
public class PdfTextExtractionController {

	private static final long MAX_FILE_SIZE = 10 * 1024 * 1024;

	@PostMapping(path = "/extract", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
	public ApiResponse<PdfTextExtractionResponse> extractText(@RequestPart("file") MultipartFile file) {
		validatePdf(file);

		try (PDDocument document = Loader.loadPDF(file.getBytes())) {
			String text = new PDFTextStripper().getText(document).trim();
			return ApiResponse.ok("PDF text extracted.", new PdfTextExtractionResponse(file.getOriginalFilename(), text));
		} catch (IOException exception) {
			throw new ApiException(HttpStatus.BAD_REQUEST, "PDF_READ_FAILED", "PDF file could not be read.");
		}
	}

	private void validatePdf(MultipartFile file) {
		if (file == null || file.isEmpty()) {
			throw new ApiException(HttpStatus.BAD_REQUEST, "PDF_FILE_REQUIRED", "PDF file is required.");
		}

		if (file.getSize() > MAX_FILE_SIZE) {
			throw new ApiException(HttpStatus.PAYLOAD_TOO_LARGE, "PDF_FILE_TOO_LARGE", "PDF file must be 10MB or smaller.");
		}

		String contentType = file.getContentType();
		if (contentType == null || !contentType.equalsIgnoreCase(MediaType.APPLICATION_PDF_VALUE)) {
			throw new ApiException(HttpStatus.UNSUPPORTED_MEDIA_TYPE, "PDF_FILE_TYPE_INVALID", "Only PDF files are allowed.");
		}
	}
}
