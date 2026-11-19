package com.petajuda.integrationtests.controllers;

import com.petajuda.configs.TestConfigs;
import com.petajuda.dtos.EnderecoDto;
import com.petajuda.dtos.request.DenunciaRequest;
import com.petajuda.dtos.request.UsuarioCredenciaisRequest;
import com.petajuda.dtos.request.UsuarioInfoRequest;
import com.petajuda.enums.StatusDenuncia;
import com.petajuda.integrationtests.AbstractIntegrationTest;
import com.petajuda.services.CloudinaryService;
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
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

import java.time.LocalDate;
import java.util.UUID;

import static io.restassured.RestAssured.given;
import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
public class DenunciaControllerTest extends AbstractIntegrationTest {

    private static final String FOTO_DENUNCIA_MOCK = "https://res.cloudinary.com/demo/image/upload/v1/petajuda/denuncias/evidencia.jpg";
    private static final String APPLICATION_JSON_UTF8 = "application/json; charset=UTF-8";

    @LocalServerPort
    private int port;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    // Mocka o serviço externo do Cloudinary para evitar uploads reais durante os testes
    @MockitoBean
    private CloudinaryService cloudinaryService;

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

    @AfterAll
    void afterAll() {
        limparBanco();
    }

    private void limparBanco() {
        jdbcTemplate.execute("TRUNCATE TABLE tabela_usuario, tabela_denuncia CASCADE;");
    }

    @BeforeEach
    void setUp() {
        // Configura o retorno simulado para uploads na pasta de denúncias
        when(cloudinaryService.enviarFoto(any(), eq("denuncias"))).thenReturn(FOTO_DENUNCIA_MOCK);

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
        EnderecoDto enderecoAdmin = new EnderecoDto("SC", "Tubarão", "Centro", "Rua Lauro Müller", "Sala 1");
        UsuarioInfoRequest usuarioRequest = new UsuarioInfoRequest(
                "Admin", "Sistema", telefone, LocalDate.of(1990, 1, 1), email, senha, enderecoAdmin
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
                endereco
        );
    }

    @Test
    @DisplayName("DenunciaControllerTest: Deve cadastrar uma denúncia anonimamente com foto de evidência (201 Created)")
    void deveCadastrarDenunciaAnonimamenteComSucesso() {
        Response response = given().spec(specification)
                .contentType(MediaType.MULTIPART_FORM_DATA_VALUE)
                // Não passamos o header de Authorization propositalmente (envio anônimo)
                .multiPart("dados", denunciaRequestPadrao, APPLICATION_JSON_UTF8)
                .multiPart("foto", "evidencia.jpg", "conteudo_evidencia_simulada".getBytes(), MediaType.IMAGE_JPEG_VALUE)
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
        assertThat(response.jsonPath().getString("fotoUrl")).isEqualTo(FOTO_DENUNCIA_MOCK);
        verify(cloudinaryService).enviarFoto(any(), eq("denuncias"));
    }

    @Test
    @DisplayName("DenunciaControllerTest: Deve retornar 400 Bad Request ao tentar cadastrar denúncia sem foto de evidência")
    void deveRetornarErroQuandoCadastrarSemFoto() {
        given().spec(specification)
                .contentType(MediaType.MULTIPART_FORM_DATA_VALUE)
                .multiPart("dados", denunciaRequestPadrao, APPLICATION_JSON_UTF8)
                .when()
                .post()
                .then()
                .statusCode(400);
    }

    @Test
    @DisplayName("DenunciaControllerTest: Deve negar acesso a rotas de leitura para usuários não autenticados ou comuns (401/403)")
    void deveNegarAcessoSemPermissaoAdmin() {
        // Tenta buscar a lista de denúncias sem token nenhum
        given().spec(specification)
                .when()
                .get()
                .then()
                .statusCode(Matchers.anyOf(Matchers.is(401), Matchers.is(403)));
    }

    @Test
    @DisplayName("DenunciaControllerTest: Administrador deve conseguir buscar uma denúncia específica por ID (200 OK)")
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
        assertThat(response.jsonPath().getString("fotoUrl")).isEqualTo(FOTO_DENUNCIA_MOCK);
    }

    @Test
    @DisplayName("DenunciaControllerTest: Administrador deve conseguir listar todas as denúncias (200 OK)")
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
    @DisplayName("DenunciaControllerTest: Administrador deve alterar o status da denúncia (200 OK)")
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
    @DisplayName("DenunciaControllerTest: Administrador deve conseguir excluir a denúncia e limpar evidência na nuvem (204 No Content)")
    void deveExcluirDenunciaSendoAdmin() {
        String denunciaId = cadastrarDenunciaAuxiliar();

        given().spec(specification)
                .header(TestConfigs.HEADER_PARAM_AUTHORIZATION, adminBearerToken)
                .pathParam("id", denunciaId)
                .when()
                .delete("/{id}")
                .then()
                .statusCode(204);

        // Garante que o serviço acionou a remoção da imagem no Cloudinary
        verify(cloudinaryService).excluirFoto(FOTO_DENUNCIA_MOCK);

        // Verifica deleção no banco
        given().spec(specification)
                .header(TestConfigs.HEADER_PARAM_AUTHORIZATION, adminBearerToken)
                .pathParam("id", denunciaId)
                .when()
                .get("/{id}")
                .then()
                .statusCode(404);
    }

    // Método auxiliar para criar uma denúncia anônima via multipart/form-data antes dos testes de ADMIN
    private String cadastrarDenunciaAuxiliar() {
        return given().spec(specification)
                .contentType(MediaType.MULTIPART_FORM_DATA_VALUE)
                .multiPart("dados", denunciaRequestPadrao, APPLICATION_JSON_UTF8)
                .multiPart("foto", "evidencia.jpg", "conteudo_evidencia_simulada".getBytes(), MediaType.IMAGE_JPEG_VALUE)
                .when()
                .post()
                .then()
                .statusCode(201)
                .extract()
                .jsonPath().getString("id");
    }
}