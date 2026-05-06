package com.capstone.server.common.api;

public record ApiResponse<T>(
	boolean success,
	String code,
	String message,
	T data
) {

	public static <T> ApiResponse<T> ok(T data) {
		return new ApiResponse<>(true, "OK", "OK", data);
	}

	public static <T> ApiResponse<T> ok(String message, T data) {
		return new ApiResponse<>(true, "OK", message, data);
	}

	public static ApiResponse<Void> error(String code, String message) {
		return new ApiResponse<>(false, code, message, null);
	}
}
