package com.petajuda.integrationtests.controllers;

import java.time.LocalDate;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestInstance;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.jdbc.core.JdbcTemplate;

import com.petajuda.configs.TestConfigs;
import com.petajuda.dtos.EnderecoDto;
import com.petajuda.dtos.request.AtualizarEmailUsuarioRequest;
import com.petajuda.dtos.request.AtualizarPerfilUsuarioRequest;
import com.petajuda.dtos.request.AtualizarSenhaUsuarioRequest;
import com.petajuda.dtos.request.UsuarioCredenciaisRequest;
import com.petajuda.dtos.request.UsuarioInfoRequest;
import com.petajuda.integrationtests.AbstractIntegrationTest;

import static io.restassured.RestAssured.given;
import io.restassured.builder.RequestSpecBuilder;
import io.restassured.filter.log.LogDetail;
import io.restassured.filter.log.RequestLoggingFilter;
import io.restassured.filter.log.ResponseLoggingFilter;
import io.restassured.response.Response;
import io.restassured.specification.RequestSpecification;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
public class UsuarioControllerTest extends AbstractIntegrationTest {

    @LocalServerPort
    private int port;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    private String tokenUsuarioComum;
    private String tokenAdmin;
    private String usuarioComumId;

    private RequestSpecification specification;

    @BeforeAll
    void beforeAll() {
        limparBanco();
    }

    @AfterEach
    void afterEach() {
        limparBanco();
    }

    @AfterAll
    void afterAll() {
        limparBanco();
    }

    private void limparBanco() {
        jdbcTemplate.execute("TRUNCATE TABLE tabela_usuario CASCADE;");
    }

    @BeforeEach
    void setUp() {
        specification = new RequestSpecBuilder()
                .setBasePath(TestConfigs.USUARIO_CONTROLLER_BASE_PATH)
                .setPort(this.port)
                .addFilter(new RequestLoggingFilter(LogDetail.ALL))
                .addFilter(new ResponseLoggingFilter(LogDetail.ALL))
                .build();

        // 1. Cadastra Usuário Comum
        String sufixoComum = UUID.randomUUID().toString().substring(0, 8);
        String emailComum = "comum." + sufixoComum + "@email.com";
        String telefoneComum = "489" + sufixoComum;

        EnderecoDto enderecoComum = new EnderecoDto("SC", "Tubarão", "Centro", "Rua Lauro Müller", "Apto 101");
        UsuarioInfoRequest requestComum = new UsuarioInfoRequest(
                "Maria", "Silva", telefoneComum, LocalDate.of(1995, 5, 15), emailComum, "senha123", enderecoComum
        );

        this.usuarioComumId = given().port(port)
                .contentType(TestConfigs.CONTENT_TYPE_JSON)
                .body(requestComum)
                .when().post(TestConfigs.AUTENTICACAO_CONTROLLER_BASE_PATH + "/cadastro")
                .then().statusCode(201)
                .extract().jsonPath().getString("id");

        this.tokenUsuarioComum = "Bearer " + given().port(port)
                .contentType(TestConfigs.CONTENT_TYPE_JSON)
                .body(new UsuarioCredenciaisRequest(emailComum, "senha123"))
                .when().post(TestConfigs.AUTENTICACAO_CONTROLLER_BASE_PATH + "/login")
                .then().statusCode(200)
                .extract().jsonPath().getString("token");

        // 2. Cadastra Usuário ADMIN
        String sufixoAdmin = UUID.randomUUID().toString().substring(0, 8);
        String emailAdmin = "admin." + sufixoAdmin + "@email.com";
        String telefoneAdmin = "479" + sufixoAdmin;

        EnderecoDto enderecoAdmin = new EnderecoDto("SC", "Florianópolis", "Centro", "Rua Felipe Schmidt", "Sala 10");
        UsuarioInfoRequest requestAdmin = new UsuarioInfoRequest(
                "Super", "Admin", telefoneAdmin, LocalDate.of(1988, 3, 10), emailAdmin, "senhaAdmin", enderecoAdmin
        );

        given().port(port)
                .contentType(TestConfigs.CONTENT_TYPE_JSON)
                .body(requestAdmin)
                .when().post(TestConfigs.AUTENTICACAO_CONTROLLER_BASE_PATH + "/cadastro")
                .then().statusCode(201);

        // Promove dinamicamente no banco para ADMIN
        jdbcTemplate.update("UPDATE tabela_usuario SET perfil_usuario = 'ADMIN' WHERE email = ?", emailAdmin);

        this.tokenAdmin = "Bearer " + given().port(port)
                .contentType(TestConfigs.CONTENT_TYPE_JSON)
                .body(new UsuarioCredenciaisRequest(emailAdmin, "senhaAdmin"))
                .when().post(TestConfigs.AUTENTICACAO_CONTROLLER_BASE_PATH + "/login")
                .then().statusCode(200)
                .extract().jsonPath().getString("token");
    }

    // =========================================================================
    // ROTAS DO PRÓPRIO USUÁRIO (/me)
    // =========================================================================

    @Test
    @DisplayName("UsuarioControllerTest: Deve retornar os dados do perfil do próprio usuário logado (200 OK)")
    void deveBuscarPerfilDoUsuarioLogado() {
        Response response = given().spec(specification)
                .header(TestConfigs.HEADER_PARAM_AUTHORIZATION, tokenUsuarioComum)
                .when()
                .get("/me")
                .then()
                .statusCode(200)
                .extract()
                .response();

        assertThat(response.jsonPath().getString("id")).isEqualTo(usuarioComumId);
        assertThat(response.jsonPath().getString("nomeCompleto")).isEqualTo("Maria Silva");
        assertThat(response.jsonPath().getString("nascimento")).isEqualTo("1995-05-15");
        assertThat(response.jsonPath().getString("endereco.cidade")).isEqualTo("Tubarão");
    }

    @Test
    @DisplayName("UsuarioControllerTest: Deve atualizar os dados básicos do perfil logado (200 OK)")
    void deveAtualizarPerfilDoUsuarioLogado() {
        EnderecoDto novoEndereco = new EnderecoDto("SC", "Laguna", "Magalhães", "Rua das Flores", "Casa 2");
        AtualizarPerfilUsuarioRequest atualizarRequest = new AtualizarPerfilUsuarioRequest(
                "Mariana", "Santos", "48999999999", LocalDate.of(1996, 8, 22), novoEndereco
        );

        Response response = given().spec(specification)
                .header(TestConfigs.HEADER_PARAM_AUTHORIZATION, tokenUsuarioComum)
                .contentType(TestConfigs.CONTENT_TYPE_JSON)
                .body(atualizarRequest)
                .when()
                .put("/me")
                .then()
                .statusCode(200)
                .extract()
                .response();

        assertThat(response.jsonPath().getString("nomeCompleto")).isEqualTo("Mariana Santos");
        assertThat(response.jsonPath().getString("telefone")).isEqualTo("48999999999");
        assertThat(response.jsonPath().getString("nascimento")).isEqualTo("1996-08-22");
        assertThat(response.jsonPath().getString("endereco.cidade")).isEqualTo("Laguna");
    }

    @Test
    @DisplayName("UsuarioControllerTest: Deve atualizar a senha do usuário logado (204 No Content)")
    void deveAtualizarSenhaDoUsuarioLogado() {
        AtualizarSenhaUsuarioRequest request = new AtualizarSenhaUsuarioRequest("senha123", "novaSenhaSegura456");

        given().spec(specification)
                .header(TestConfigs.HEADER_PARAM_AUTHORIZATION, tokenUsuarioComum)
                .contentType(TestConfigs.CONTENT_TYPE_JSON)
                .body(request)
                .when()
                .patch("/me/senha")
                .then()
                .statusCode(204);
    }

    @Test
    @DisplayName("UsuarioControllerTest: Deve atualizar e-mail do usuário logado e retornar novo Token (200 OK)")
    void deveAtualizarEmailEGerarNovoToken() {
        AtualizarEmailUsuarioRequest request = new AtualizarEmailUsuarioRequest("maria.nova@email.com");

        Response response = given().spec(specification)
                .header(TestConfigs.HEADER_PARAM_AUTHORIZATION, tokenUsuarioComum)
                .contentType(TestConfigs.CONTENT_TYPE_JSON)
                .body(request)
                .when()
                .patch("/me/email")
                .then()
                .statusCode(200)
                .extract()
                .response();

        assertThat(response.jsonPath().getString("email")).isEqualTo("maria.nova@email.com");
        assertThat(response.jsonPath().getString("token")).isNotNull().isNotBlank();
    }

    // =========================================================================
    // ROTAS ADMINISTRATIVAS
    // =========================================================================

    @Test
    @DisplayName("UsuarioControllerTest: Admin deve conseguir listar todos os usuários paginados (200 OK)")
    void deveListarTodosOsUsuariosSendoAdmin() {
        Response response = given().spec(specification)
                .header(TestConfigs.HEADER_PARAM_AUTHORIZATION, tokenAdmin)
                .when()
                .get()
                .then()
                .statusCode(200)
                .extract()
                .response();

        // O retorno de Page<> do Spring encapsula a lista dentro de "content"
        assertThat(response.jsonPath().getList("content")).isNotEmpty();
    }

    @Test
    @DisplayName("UsuarioControllerTest: Admin deve conseguir buscar usuário específico por ID (200 OK)")
    void deveBuscarUsuarioPorIdSendoAdmin() {
        Response response = given().spec(specification)
                .header(TestConfigs.HEADER_PARAM_AUTHORIZATION, tokenAdmin)
                .pathParam("id", usuarioComumId)
                .when()
                .get("/{id}")
                .then()
                .statusCode(200)
                .extract()
                .response();

        assertThat(response.jsonPath().getString("id")).isEqualTo(usuarioComumId);
    }

    @Test
    @DisplayName("UsuarioControllerTest: Admin deve conseguir desativar e reativar um usuário (204 No Content)")
    void deveDesativarEReativarUsuarioSendoAdmin() {
        // 1. Desativa
        given().spec(specification)
                .header(TestConfigs.HEADER_PARAM_AUTHORIZATION, tokenAdmin)
                .pathParam("id", usuarioComumId)
                .when()
                .patch("/{id}/desativar")
                .then()
                .statusCode(204);

        // 2. Reativa
        given().spec(specification)
                .header(TestConfigs.HEADER_PARAM_AUTHORIZATION, tokenAdmin)
                .pathParam("id", usuarioComumId)
                .when()
                .patch("/{id}/reativar")
                .then()
                .statusCode(204);
    }
}