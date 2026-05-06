package com.capstone.server.common.api;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.ErrorResponseException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.multipart.MaxUploadSizeExceededException;
import org.springframework.web.multipart.support.MissingServletRequestPartException;

@RestControllerAdvice
public class GlobalExceptionHandler {

	@ExceptionHandler(ApiException.class)
	public ResponseEntity<ApiResponse<Void>> handleApiException(ApiException exception) {
		return ResponseEntity
			.status(exception.getStatusCode())
			.body(ApiResponse.error(exception.getCode(), exception.getMessage()));
	}

	@ExceptionHandler(MissingServletRequestPartException.class)
	public ResponseEntity<ApiResponse<Void>> handleMissingPart(MissingServletRequestPartException exception) {
		return ResponseEntity
			.badRequest()
			.body(ApiResponse.error("REQUEST_PART_MISSING", "Required request part is missing."));
	}

	@ExceptionHandler(MaxUploadSizeExceededException.class)
	public ResponseEntity<ApiResponse<Void>> handleMaxUploadSizeExceeded(MaxUploadSizeExceededException exception) {
		return ResponseEntity
			.status(HttpStatus.PAYLOAD_TOO_LARGE)
			.body(ApiResponse.error("FILE_TOO_LARGE", "Uploaded file is too large."));
	}

	@ExceptionHandler(MethodArgumentNotValidException.class)
	public ResponseEntity<ApiResponse<Void>> handleValidationException(MethodArgumentNotValidException exception) {
		String message = exception.getBindingResult().getFieldErrors().stream()
			.findFirst()
			.map(error -> error.getField() + ": " + error.getDefaultMessage())
			.orElse("Invalid request.");

		return ResponseEntity
			.badRequest()
			.body(ApiResponse.error("VALIDATION_FAILED", message));
	}

	@ExceptionHandler(ErrorResponseException.class)
	public ResponseEntity<ApiResponse<Void>> handleErrorResponse(ErrorResponseException exception) {
		return ResponseEntity
			.status(exception.getStatusCode())
			.body(ApiResponse.error("HTTP_" + exception.getStatusCode().value(), exception.getMessage()));
	}

	@ExceptionHandler(Exception.class)
	public ResponseEntity<ApiResponse<Void>> handleUnexpectedException(Exception exception) {
		return ResponseEntity
			.status(HttpStatus.INTERNAL_SERVER_ERROR)
			.body(ApiResponse.error("INTERNAL_SERVER_ERROR", "Unexpected server error."));
	}
}
