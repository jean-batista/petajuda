package com.petajuda.integrationtests.swagger;

import static io.restassured.RestAssured.given;
import static org.assertj.core.api.Assertions.assertThat;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;

import com.petajuda.configs.TestConfigs;
import com.petajuda.integrationtests.AbstractIntegrationTest;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
public class SwaggerIntegrationTest extends AbstractIntegrationTest {

    @LocalServerPort
    private int port;

    @Test
    @DisplayName("Swagger: Deve exibir a página inicial do Swagger UI")
    public void deveExibirPaginaSwaggerUi() {
        var content = given()
                .port(port)
                .basePath(TestConfigs.SWAGGER_UI_BASE_PATH)
                .when()
                .get()
                .then()
                .statusCode(200)
                .extract()
                .body()
                .asString();

        assertThat(content).contains("Swagger UI");
    }

    @Test
    @DisplayName("Swagger: Deve retornar a documentação JSON do OpenAPI v3")
    public void deveRetornarDocumentacaoOpenApiJson() {
        given()
                .port(port)
                .basePath(TestConfigs.OPENAPI_JSON_BASE_PATH)
                .when()
                .get()
                .then()
                .statusCode(200)
                .contentType(TestConfigs.CONTENT_TYPE_JSON);
    }
}