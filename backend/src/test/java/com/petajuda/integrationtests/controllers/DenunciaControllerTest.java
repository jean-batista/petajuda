package com.petajuda.integrationtests.controllers;

import com.petajuda.configs.TestConfigs;
import com.petajuda.dtos.EnderecoDto;
import com.petajuda.dtos.request.DenunciaRequest;
import com.petajuda.dtos.request.UsuarioCredenciaisRequest;
import com.petajuda.dtos.request.UsuarioInfoRequest;
import com.petajuda.enums.StatusDenuncia;
import com.petajuda.integrationtests.AbstractIntegrationTest;
import io.restassured.builder.RequestSpecBuilder;
import io.restassured.filter.log.LogDetail;
import io.restassured.filter.log.RequestLoggingFilter;
import io.restassured.filter.log.ResponseLoggingFilter;
import io.restassured.response.Response;
import io.restassured.specification.RequestSpecification;
import org.hamcrest.Matchers;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.jdbc.core.JdbcTemplate;

import java.util.UUID;

import static io.restassured.RestAssured.given;
import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
public class DenunciaControllerTest extends AbstractIntegrationTest {

    @LocalServerPort
    private int port;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    private String adminBearerToken;
    private DenunciaRequest denunciaRequestPadrao;
    private RequestSpecification specification;

    @BeforeAll
    void beforeAll() {
        limparBanco();
    }

    @AfterEach
    void afterEach() {
        limparBanco();
    }

    private void limparBanco() {
        jdbcTemplate.execute("TRUNCATE TABLE tabela_usuario, tabela_denuncia CASCADE;");
    }

    @BeforeEach
    void setUp() {
        specification = new RequestSpecBuilder()
                .setBasePath(TestConfigs.DENUNCIA_CONTROLLER_BASE_PATH)
                .setPort(this.port)
                .addFilter(new RequestLoggingFilter(LogDetail.ALL))
                .addFilter(new ResponseLoggingFilter(LogDetail.ALL))
                .build();

        String sufixoUnico = UUID.randomUUID().toString().substring(0, 8);
        String email = "admin." + sufixoUnico + "@email.com";
        String telefone = "489" + sufixoUnico;
        String senha = "senhaAdmin123";

        // 1. Cadastra um usuário normal
        UsuarioInfoRequest usuarioRequest = new UsuarioInfoRequest(
                "Admin", "Sistema", telefone, email, senha
        );

        given().port(port)
                .contentType(TestConfigs.CONTENT_TYPE_JSON)
                .body(usuarioRequest)
                .when().post(TestConfigs.AUTENTICACAO_CONTROLLER_BASE_PATH + "/cadastro")
                .then().statusCode(201);

        // 2. Promove o usuário a ADMIN diretamente no banco (Bypass de segurança para o teste)
        jdbcTemplate.update("UPDATE tabela_usuario SET perfil_usuario = 'ADMIN' WHERE email = ?", email);

        // 3. Faz o login para pegar o Token com a authority ROLE_ADMIN
        String token = given().port(port)
                .contentType(TestConfigs.CONTENT_TYPE_JSON)
                .body(new UsuarioCredenciaisRequest(email, senha))
                .when().post(TestConfigs.AUTENTICACAO_CONTROLLER_BASE_PATH + "/login")
                .then().statusCode(200)
                .extract().jsonPath().getString("token");

        this.adminBearerToken = "Bearer " + token;

        // 4. Instancia um request padrão de Denúncia
        EnderecoDto endereco = new EnderecoDto("SC", "Tubarão", "Oficinas", "Rua X", "Perto do mercado");
        this.denunciaRequestPadrao = new DenunciaRequest(
                "Cachorro abandonado",
                "Cachorro preso sem água há dias",
                "http://foto.com/evidencia.jpg",
                endereco
        );
    }

    @Test
    @DisplayName("DenunciaControllerIT: Deve cadastrar uma denúncia anonimamente com sucesso (201 Created)")
    void deveCadastrarDenunciaAnonimamenteComSucesso() {
        Response response = given().spec(specification)
                .contentType(TestConfigs.CONTENT_TYPE_JSON)
                // Não passamos o header de Authorization propositalmente (teste anônimo)
                .body(denunciaRequestPadrao)
                .when()
                .post()
                .then()
                .statusCode(201)
                .extract()
                .response();

        String id = response.jsonPath().getString("id");

        assertThat(id).isNotNull();
        assertThat(response.jsonPath().getString("titulo")).isEqualTo("Cachorro abandonado");
        assertThat(response.jsonPath().getString("status")).isEqualTo(StatusDenuncia.PENDENTE.name());
    }

    @Test
    @DisplayName("DenunciaControllerIT: Deve negar acesso a rotas de leitura para usuários não autenticados ou comuns (401/403)")
    void deveNegarAcessoSemPermissaoAdmin() {
        // Tenta buscar a lista de denúncias sem token nenhum
        given().spec(specification)
                .when()
                .get()
                .then()
                .statusCode(Matchers.anyOf(Matchers.is(401), Matchers.is(403)));
    }

    @Test
    @DisplayName("DenunciaControllerIT: Administrador deve conseguir buscar uma denúncia específica por ID (200 OK)")
    void deveBuscarDenunciaPorIdSendoAdmin() {
        String denunciaId = cadastrarDenunciaAuxiliar();

        Response response = given().spec(specification)
                .header(TestConfigs.HEADER_PARAM_AUTHORIZATION, adminBearerToken) // Usa o token de ADMIN
                .pathParam("id", denunciaId)
                .when()
                .get("/{id}")
                .then()
                .statusCode(200)
                .extract()
                .response();

        assertThat(response.jsonPath().getString("id")).isEqualTo(denunciaId);
    }

    @Test
    @DisplayName("DenunciaControllerIT: Administrador deve conseguir listar todas as denúncias (200 OK)")
    void deveListarTodasAsDenunciasSendoAdmin() {
        cadastrarDenunciaAuxiliar();

        Response response = given().spec(specification)
                .header(TestConfigs.HEADER_PARAM_AUTHORIZATION, adminBearerToken)
                .when()
                .get()
                .then()
                .statusCode(200)
                .extract()
                .response();

        // O retorno é uma lista (JSON Array)
        assertThat(response.jsonPath().getList("")).isNotEmpty();
    }

    @Test
    @DisplayName("DenunciaControllerIT: Administrador deve alterar o status da denúncia (200 OK)")
    void deveAlterarStatusDaDenunciaSendoAdmin() {
        String denunciaId = cadastrarDenunciaAuxiliar();

        Response response = given().spec(specification)
                .header(TestConfigs.HEADER_PARAM_AUTHORIZATION, adminBearerToken)
                .pathParam("id", denunciaId)
                .queryParam("status", StatusDenuncia.EM_ANALISE.name())
                .when()
                .patch("/{id}/status")
                .then()
                .statusCode(200)
                .extract()
                .response();

        assertThat(response.jsonPath().getString("status")).isEqualTo(StatusDenuncia.EM_ANALISE.name());
    }

    @Test
    @DisplayName("DenunciaControllerIT: Administrador deve conseguir excluir a denúncia (204 No Content)")
    void deveExcluirDenunciaSendoAdmin() {
        String denunciaId = cadastrarDenunciaAuxiliar();

        given().spec(specification)
                .header(TestConfigs.HEADER_PARAM_AUTHORIZATION, adminBearerToken)
                .pathParam("id", denunciaId)
                .when()
                .delete("/{id}")
                .then()
                .statusCode(204);

        // Verifica deleção
        given().spec(specification)
                .header(TestConfigs.HEADER_PARAM_AUTHORIZATION, adminBearerToken)
                .pathParam("id", denunciaId)
                .when()
                .get("/{id}")
                .then()
                .statusCode(404);
    }

    // Método auxiliar para criar uma denúncia anônima antes dos testes de ADMIN
    private String cadastrarDenunciaAuxiliar() {
        return given().spec(specification)
                .contentType(TestConfigs.CONTENT_TYPE_JSON)
                .body(denunciaRequestPadrao)
                .when()
                .post()
                .then()
                .statusCode(201)
                .extract()
                .jsonPath().getString("id");
    }
}