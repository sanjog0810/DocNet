package com.example.demo.service;

import com.example.demo.model.AIDiagnosis;
import com.example.demo.model.AiRequest;
import com.example.demo.model.AiResponse;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.web.reactive.function.client.WebClient;

@Service
public class AiService {

    @Value("${openrouter.api.key}")
    private String apiKey;


    private final String MODEL = "deepseek/deepseek-r1-0528-qwen3-8b:free";
    private final String API_URL = "https://openrouter.ai/api/v1/chat/completions";
    private final String REFERER = "https://your-site-url.com"; // Change to your domain
    private final String TITLE = "DocNet";

    private final WebClient webClient = WebClient.builder().build();


    public AiResponse getReply(AiRequest request) {
        String prompt = request.getPrompt();

        String requestBody = """
                {
                  "model": "%s",
                  "messages": [
                    {
                      "role": "user",
                      "content": "%s"
                    }
                  ]
                }
                """.formatted(MODEL, prompt.replace("\"", "\\\""));

        return webClient.post()
                .uri(API_URL)
                .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + apiKey)
                .header("HTTP-Referer", REFERER)
                .header("X-Title", TITLE)
                .bodyValue(requestBody)
                .retrieve()
                .bodyToMono(String.class)
                .map(json -> {
                    String content = extractContentFromJson(json);
                    return new AiResponse(content);
                }).block();
    }

    private String extractContentFromJson(String json) {
        try {
            ObjectMapper mapper = new ObjectMapper();
            JsonNode root = mapper.readTree(json);
            JsonNode choices = root.get("choices");

            if (choices != null && choices.isArray() && choices.size() > 0) {
                JsonNode message = choices.get(0).get("message");
                if (message != null && message.has("content")) {
                    return message.get("content").asText();
                }
            }
            return "No content found in the AI response.";
        } catch (Exception e) {
            return "Failed to parse AI response.";
        }
    }

    public ResponseEntity<AIDiagnosis> diagnose(String symptoms) {
        AiRequest request = new AiRequest();
        String prompt = """
You are a medical diagnostic assistant AI. Given a list of symptoms described by a user, respond **only** with a **raw JSON object** in the exact format shown below.

Strictly follow these rules:
- Do NOT add any markdown, no triple backticks.
- Do NOT explain anything.
- Output ONLY the JSON object.
- The response MUST be a valid JSON, with double quotes for keys and string values.

Expected JSON format:
{
  "possibleConditions": [
    {
      "condition": "Condition name",
      "probability": Decimal number between 0 and 1,
      "description": "Brief explanation of the condition."
    }
  ],
  "recommendedTests": [
    "Name of diagnostic test 1",
    "Name of diagnostic test 2"
  ]
}

The user is experiencing: %s

Repeat: Output only valid JSON. No text, no formatting, no explanations. Just the JSON.
""".formatted(symptoms);

        request.setPrompt(prompt);
        AiResponse response = getReply(request);
        String cleaned = response.getReply().replaceAll("(?s)```json|```", "").trim();

        response.setReply(cleaned);
        System.out.println(response.getReply());
        try {
            ObjectMapper mapper = new ObjectMapper();
            AIDiagnosis diagnosis = mapper.readValue(response.getReply(), AIDiagnosis.class);
            return ResponseEntity.ok(diagnosis);

        } catch (JsonProcessingException e) {
            // Return null or an empty AIDiagnosis object in case of error
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    public String getFacts() {
        String prompt = """
You are a healthcare assistant. Return a raw JSON array of exactly 5 health-related facts that would be useful for doctors, patients, or general medical knowledge.

Strictly follow these rules:
- Output ONLY a JSON array, nothing else. No text, no formatting, no markdown.
- Each JSON object should contain:
  - "title": Short catchy title.
  - "description": One or two sentence explanation.
  - "category": One of "Nutrition", "Exercise", "Mental Health", "Preventive Care", or "General".
  - "source": A relevant organization or body, e.g., "WHO", "CDC", "American Heart Association".

Example format:
[
  {
    "title": "Stay Hydrated",
    "description": "Drinking enough water helps maintain the balance of body fluids and improves energy levels.",
    "category": "Nutrition",
    "source": "WHO Guidelines"
  }
]

Now generate 5 facts only in this format.
""";

        AiRequest request = new AiRequest();
        request.setPrompt(prompt);

        AiResponse response = getReply(request);

        // Remove potential backticks if present
        String cleaned = response.getReply().replaceAll("(?s)```json|```", "").trim();
        System.out.println(cleaned);
        return cleaned;
    }

}




