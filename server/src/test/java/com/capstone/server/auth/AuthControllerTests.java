package com.capstone.server.auth;

import static org.hamcrest.Matchers.not;
import static org.hamcrest.Matchers.nullValue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
class AuthControllerTests {

	@Autowired
	private MockMvc mockMvc;

	@Test
	void signsUpAndLogsIn() throws Exception {
		String signupRequest = """
			{
			  "username": "authuser",
			  "email": "authuser@example.com",
			  "password": "password123",
			  "name": "Auth User",
			  "nickname": "auth",
			  "phone": "010-1111-2222",
			  "role": "RENTER"
			}
			""";

		mockMvc.perform(post("/api/auth/signup")
				.contentType(MediaType.APPLICATION_JSON)
				.content(signupRequest))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.success").value(true))
			.andExpect(jsonPath("$.data.username").value("authuser"))
			.andExpect(jsonPath("$.data.password").doesNotExist())
			.andExpect(jsonPath("$.data.createdAt").value(not(nullValue())));

		String loginRequest = """
			{
			  "username": "authuser",
			  "password": "password123"
			}
			""";

		mockMvc.perform(post("/api/auth/login")
				.contentType(MediaType.APPLICATION_JSON)
				.content(loginRequest))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.success").value(true))
			.andExpect(jsonPath("$.data.username").value("authuser"));
	}

	@Test
	void rejectsInvalidLogin() throws Exception {
		String loginRequest = """
			{
			  "username": "missing",
			  "password": "wrong-password"
			}
			""";

		mockMvc.perform(post("/api/auth/login")
				.contentType(MediaType.APPLICATION_JSON)
				.content(loginRequest))
			.andExpect(status().isUnauthorized())
			.andExpect(jsonPath("$.success").value(false))
			.andExpect(jsonPath("$.code").value("LOGIN_FAILED"));
	}
}
