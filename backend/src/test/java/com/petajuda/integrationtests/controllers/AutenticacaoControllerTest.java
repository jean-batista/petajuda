package com.petajuda.integrationtests.controllers;

import java.time.LocalDate;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import org.hamcrest.Matchers;
import org.junit.jupiter.api.AfterAll;
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
public class AutenticacaoControllerTest extends AbstractIntegrationTest {

    @LocalServerPort
    private int port;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    private RequestSpecification specification;

    @BeforeAll
    void beforeAll() {
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
                .setBasePath(TestConfigs.AUTENTICACAO_CONTROLLER_BASE_PATH)
                .setPort(this.port)
                .addFilter(new RequestLoggingFilter(LogDetail.ALL))
                .addFilter(new ResponseLoggingFilter(LogDetail.ALL))
                .build();
    }

    @Test
    @DisplayName("Cadastro: Deve cadastrar um novo usuário com sucesso e retornar 201 Created")
    void deveCadastrarUsuarioComSucesso() {
        String sufixoUnico = UUID.randomUUID().toString().substring(0, 8);
        String email = "novo.usuario." + sufixoUnico + "@email.com";
        String telefone = "489" + sufixoUnico;
        EnderecoDto endereco = new EnderecoDto("SC", "Tubarão", "Centro", "Rua XV de Novembro", "Apto 101");

        // Ordem do record: nome, sobrenome, telefone, nascimento, email, senha, endereco
        UsuarioInfoRequest request = new UsuarioInfoRequest(
                "Lucas", "Pereira", telefone, LocalDate.of(1995, 5, 15), email, "senhaForte123", endereco
        );

        Response response = given().spec(specification)
                .contentType(TestConfigs.CONTENT_TYPE_JSON)
                .body(request)
                .when()
                .post("/cadastro")
                .then()
                .statusCode(201)
                .extract()
                .response();

        String id = response.jsonPath().getString("id");

        assertThat(id).isNotNull();
        assertThat(response.jsonPath().getString("email")).isEqualTo(email);
        assertThat(response.jsonPath().getString("nomeCompleto")).isEqualTo("Lucas Pereira");
        assertThat(response.jsonPath().getString("nascimento")).isEqualTo("1995-05-15");
        assertThat(response.jsonPath().getString("endereco.cidade")).isEqualTo("Tubarão");
        assertThat(response.jsonPath().getBoolean("ativo")).isTrue();
        assertThat(response.header("Location")).contains("/api/v1/usuarios/" + id);
    }

    @Test
    @DisplayName("Cadastro: Deve retornar 400 Bad Request ao tentar cadastrar usuário menor de 18 anos")
    void deveRetornarErroAoCadastrarUsuarioMenorDeIdade() {
        String sufixoUnico = UUID.randomUUID().toString().substring(0, 8);
        String email = "menor.idade." + sufixoUnico + "@email.com";
        String telefone = "489" + sufixoUnico;
        EnderecoDto endereco = new EnderecoDto("SC", "Tubarão", "Centro", "Rua XV de Novembro", "Casa 1");

        UsuarioInfoRequest request = new UsuarioInfoRequest(
                "Pedro", "Santos", telefone, LocalDate.now().minusYears(16), email, "senhaForte123", endereco
        );

        given().spec(specification)
                .contentType(TestConfigs.CONTENT_TYPE_JSON)
                .body(request)
                .when()
                .post("/cadastro")
                .then()
                .statusCode(400);
    }

    @Test
    @DisplayName("Login: Deve autenticar o usuário e retornar o token JWT (200 OK)")
    void deveFazerLoginComSucesso() {
        String sufixoUnico = UUID.randomUUID().toString().substring(0, 8);
        String email = "login.teste." + sufixoUnico + "@email.com";
        String telefone = "479" + sufixoUnico;
        String senha = "minhasenha123";
        EnderecoDto endereco = new EnderecoDto("SC", "Laguna", "Magalhães", "Rua das Flores", "Casa 2");

        // 1. Cadastra o usuário primeiro
        UsuarioInfoRequest cadastroRequest = new UsuarioInfoRequest(
                "Maria", "Silva", telefone, LocalDate.of(1998, 10, 20), email, senha, endereco
        );

        given().spec(specification)
                .contentType(TestConfigs.CONTENT_TYPE_JSON)
                .body(cadastroRequest)
                .when()
                .post("/cadastro")
                .then()
                .statusCode(201);

        // 2. Faz o login com as credenciais cadastradas
        UsuarioCredenciaisRequest loginRequest = new UsuarioCredenciaisRequest(email, senha);

        Response response = given().spec(specification)
                .contentType(TestConfigs.CONTENT_TYPE_JSON)
                .body(loginRequest)
                .when()
                .post("/login")
                .then()
                .statusCode(200)
                .extract()
                .response();

        String token = response.jsonPath().getString("token");

        assertThat(token).isNotNull().isNotBlank();
        assertThat(response.jsonPath().getString("email")).isEqualTo(email);
    }

    @Test
    @DisplayName("Login: Deve falhar e retornar 401/403 ao tentar logar com senha incorreta")
    void deveFalharAoLogarComSenhaIncorreta() {
        UsuarioCredenciaisRequest loginRequest = new UsuarioCredenciaisRequest(
                "nao.existe@email.com", "senhaIncorreta"
        );

        given().spec(specification)
                .contentType(TestConfigs.CONTENT_TYPE_JSON)
                .body(loginRequest)
                .when()
                .post("/login")
                .then()
                // Pode retornar 401 ou 403 dependendo do GlobalExceptionHandler
                .statusCode(Matchers.anyOf(Matchers.is(401), Matchers.is(403)));
    }

    @Test
    @DisplayName("Refresh Token: Deve renovar o token JWT passando o token atual no header")
    void deveRenovarTokenComSucesso() {
        String sufixoUnico = UUID.randomUUID().toString().substring(0, 8);
        String email = "refresh.teste." + sufixoUnico + "@email.com";
        String telefone = "469" + sufixoUnico;
        String senha = "senhaForte123";
        EnderecoDto endereco = new EnderecoDto("SC", "Capivari de Baixo", "Centro", "Av. Nilton Augusto Sachetti", "Apto 302");

        // 1. Cadastra o usuário
        UsuarioInfoRequest cadastroRequest = new UsuarioInfoRequest(
                "Ana", "Souza", telefone, LocalDate.of(1993, 7, 12), email, senha, endereco
        );

        given().spec(specification)
                .contentType(TestConfigs.CONTENT_TYPE_JSON)
                .body(cadastroRequest)
                .when()
                .post("/cadastro")
                .then()
                .statusCode(201);

        // 2. Faz o login para pegar o token original
        UsuarioCredenciaisRequest loginRequest = new UsuarioCredenciaisRequest(email, senha);

        String tokenOriginal = given().spec(specification)
                .contentType(TestConfigs.CONTENT_TYPE_JSON)
                .body(loginRequest)
                .when()
                .post("/login")
                .then()
                .statusCode(200)
                .extract()
                .jsonPath().getString("token");

        // 3. Chama o endpoint de refresh passando o Bearer token
        Response refreshResponse = given().spec(specification)
                .header(TestConfigs.HEADER_PARAM_AUTHORIZATION, "Bearer " + tokenOriginal)
                .when()
                .post("/refresh")
                .then()
                .statusCode(200)
                .extract()
                .response();

        String novoToken = refreshResponse.jsonPath().getString("token");

        assertThat(novoToken).isNotNull().isNotBlank();
    }
}