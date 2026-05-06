package com.capstone.server.common.api;

import org.springframework.http.HttpStatusCode;

public class ApiException extends RuntimeException {

	private final HttpStatusCode statusCode;
	private final String code;

	public ApiException(HttpStatusCode statusCode, String code, String message) {
		super(message);
		this.statusCode = statusCode;
		this.code = code;
	}

	public HttpStatusCode getStatusCode() {
		return statusCode;
	}

	public String getCode() {
		return code;
	}
}
