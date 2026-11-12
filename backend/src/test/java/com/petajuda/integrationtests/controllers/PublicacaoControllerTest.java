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
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

import com.petajuda.configs.TestConfigs;
import com.petajuda.dtos.EnderecoDto;
import com.petajuda.dtos.request.AnimalRequest;
import com.petajuda.dtos.request.PublicacaoRequest;
import com.petajuda.dtos.request.UsuarioCredenciaisRequest;
import com.petajuda.dtos.request.UsuarioInfoRequest;
import com.petajuda.enums.EspecieAnimal;
import com.petajuda.enums.IdadeAnimal;
import com.petajuda.enums.PorteAnimal;
import com.petajuda.enums.StatusPublicacao;
import com.petajuda.enums.TipoPublicacao;
import com.petajuda.integrationtests.AbstractIntegrationTest;
import com.petajuda.services.CloudinaryService;

import static io.restassured.RestAssured.given;
import io.restassured.builder.RequestSpecBuilder;
import io.restassured.filter.log.LogDetail;
import io.restassured.filter.log.RequestLoggingFilter;
import io.restassured.filter.log.ResponseLoggingFilter;
import io.restassured.response.Response;
import io.restassured.specification.RequestSpecification;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
public class PublicacaoControllerTest extends AbstractIntegrationTest {

    private static final String FOTO_ANIMAL_MOCK = "https://res.cloudinary.com/demo/image/upload/v1/petajuda/animais/bolinha.jpg";
    private static final String FOTO_PUBLICACAO_MOCK = "https://res.cloudinary.com/demo/image/upload/v1/petajuda/publicacoes/avistamento.jpg";
    private static final String APPLICATION_JSON_UTF8 = "application/json; charset=UTF-8";

    @LocalServerPort
    private int port;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    // Mocka o serviço externo do Cloudinary para evitar chamadas reais de rede durante os testes
    @MockitoBean
    private CloudinaryService cloudinaryService;

    private String bearerToken;
    private String animalId;
    private PublicacaoRequest publicacaoRequestPadrao;
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
        // Limpa tabelas na ordem de dependência (Cascade)
        jdbcTemplate.execute("TRUNCATE TABLE tabela_usuario, tabela_animal, tabela_publicacao CASCADE;");
    }

    @BeforeEach
    void setUp() {
        // Configura o retorno simulado para uploads na pasta de animais e de publicações
        when(cloudinaryService.enviarFoto(any(), eq("animais"))).thenReturn(FOTO_ANIMAL_MOCK);
        when(cloudinaryService.enviarFoto(any(), eq("publicacoes"))).thenReturn(FOTO_PUBLICACAO_MOCK);

        specification = new RequestSpecBuilder()
                .setBasePath(TestConfigs.PUBLICACAO_CONTROLLER_BASE_PATH)
                .setPort(this.port)
                .addFilter(new RequestLoggingFilter(LogDetail.ALL))
                .addFilter(new ResponseLoggingFilter(LogDetail.ALL))
                .build();

        String sufixoUnico = UUID.randomUUID().toString().substring(0, 8);
        String email = "dono.post." + sufixoUnico + "@email.com";
        String telefone = "489" + sufixoUnico;
        String senha = "senhaSegura123";

        // 1. Cadastra o usuário dono do post
        EnderecoDto enderecoUsuario = new EnderecoDto("SC", "Tubarão", "Centro", "Rua Capitão Alexandre de Sá", "Casa 10");
        UsuarioInfoRequest usuarioRequest = new UsuarioInfoRequest(
                "Fernanda", "Lima", telefone, LocalDate.of(1994, 3, 12), email, senha, enderecoUsuario
        );

        given().port(port)
                .contentType(TestConfigs.CONTENT_TYPE_JSON)
                .body(usuarioRequest)
                .when().post(TestConfigs.AUTENTICACAO_CONTROLLER_BASE_PATH + "/cadastro")
                .then().statusCode(201);

        // 2. Faz Login e pega o Token JWT
        String token = given().port(port)
                .contentType(TestConfigs.CONTENT_TYPE_JSON)
                .body(new UsuarioCredenciaisRequest(email, senha))
                .when().post(TestConfigs.AUTENTICACAO_CONTROLLER_BASE_PATH + "/login")
                .then().statusCode(200)
                .extract().jsonPath().getString("token");

        this.bearerToken = "Bearer " + token;

        // 3. Cadastra um Animal via multipart/form-data atrelado a este usuário
        AnimalRequest animalRequest = new AnimalRequest(
                "Bolinha", "Fêmea", "Branca", true, true,
                "Gatinha muito mansa", IdadeAnimal.FILHOTE, PorteAnimal.PEQUENO, EspecieAnimal.GATO
        );

        this.animalId = given().port(port)
                .header(TestConfigs.HEADER_PARAM_AUTHORIZATION, bearerToken)
                .contentType(MediaType.MULTIPART_FORM_DATA_VALUE)
                .multiPart("dados", animalRequest, APPLICATION_JSON_UTF8)
                .multiPart("foto", "bolinha.jpg", "conteudo_imagem_simulada".getBytes(), MediaType.IMAGE_JPEG_VALUE)
                .when().post(TestConfigs.ANIMAL_CONTROLLER_BASE_PATH)
                .then().statusCode(201)
                .extract().jsonPath().getString("id");

        // 4. Inicia o DTO padrão de Publicação vinculada ao animal cadastrado
        EnderecoDto endereco = new EnderecoDto("SC", "Tubarão", "Passagem", "Rua Z", "Perto da ponte");
        this.publicacaoRequestPadrao = new PublicacaoRequest(
                "Gatinha Perdida", "Fugiu perto da ponte na Passagem",
                TipoPublicacao.PERDIDO, UUID.fromString(animalId), endereco
        );
    }

    @Test
    @DisplayName("PublicacaoControllerTest: Deve criar publicação vinculada a animal herdando sua foto (201 Created)")
    void deveCadastrarPublicacaoComSucesso() {
        Response response = given().spec(specification)
                .header(TestConfigs.HEADER_PARAM_AUTHORIZATION, bearerToken)
                .contentType(MediaType.MULTIPART_FORM_DATA_VALUE)
                .multiPart("dados", publicacaoRequestPadrao, APPLICATION_JSON_UTF8)
                .when()
                .post()
                .then()
                .statusCode(201)
                .extract()
                .response();

        String id = response.jsonPath().getString("id");

        assertThat(id).isNotNull();
        assertThat(response.jsonPath().getString("titulo")).isEqualTo("Gatinha Perdida");
        assertThat(response.jsonPath().getString("animalId")).isEqualTo(this.animalId);
        assertThat(response.jsonPath().getString("status")).isEqualTo(StatusPublicacao.ATIVO.name());
        assertThat(response.jsonPath().getString("fotoUrl")).isEqualTo(FOTO_ANIMAL_MOCK);
    }

    @Test
    @DisplayName("PublicacaoControllerTest: Deve criar publicação de animal ENCONTRADO sem vínculo enviando foto própria (201 Created)")
    void deveCadastrarPublicacaoEncontradoSemAnimalComFotoPropria() {
        EnderecoDto endereco = new EnderecoDto("SC", "Tubarão", "Centro", "Av. Marcolino", "Em frente à praça");
        PublicacaoRequest requestEncontrado = new PublicacaoRequest(
                "Cachorro Encontrado", "Cachorro sem coleira andando na praça",
                TipoPublicacao.ENCONTRADO, null, endereco
        );

        Response response = given().spec(specification)
                .header(TestConfigs.HEADER_PARAM_AUTHORIZATION, bearerToken)
                .contentType(MediaType.MULTIPART_FORM_DATA_VALUE)
                .multiPart("dados", requestEncontrado, APPLICATION_JSON_UTF8)
                .multiPart("foto", "avistamento.jpg", "bytes_da_foto_avistamento".getBytes(), MediaType.IMAGE_JPEG_VALUE)
                .when()
                .post()
                .then()
                .statusCode(201)
                .extract()
                .response();

        assertThat(response.jsonPath().getString("id")).isNotNull();
        assertThat(response.jsonPath().getString("animalId")).isNull();
        assertThat(response.jsonPath().getString("fotoUrl")).isEqualTo(FOTO_PUBLICACAO_MOCK);
        verify(cloudinaryService).enviarFoto(any(), eq("publicacoes"));
    }

    @Test
    @DisplayName("PublicacaoControllerTest: Deve retornar 400 Bad Request para publicação ENCONTRADO sem animal e sem foto")
    void deveRetornarErroQuandoEncontradoSemAnimalESemFoto() {
        EnderecoDto endereco = new EnderecoDto("SC", "Tubarão", "Centro", "Av. Marcolino", "Em frente à praça");
        PublicacaoRequest requestInvalido = new PublicacaoRequest(
                "Cachorro Encontrado", "Sem foto e sem animal",
                TipoPublicacao.ENCONTRADO, null, endereco
        );

        given().spec(specification)
                .header(TestConfigs.HEADER_PARAM_AUTHORIZATION, bearerToken)
                .contentType(MediaType.MULTIPART_FORM_DATA_VALUE)
                .multiPart("dados", requestInvalido, APPLICATION_JSON_UTF8)
                .when()
                .post()
                .then()
                .statusCode(400);
    }

    @Test
    @DisplayName("PublicacaoControllerTest: Deve buscar uma publicação por ID retornando 200 OK")
    void deveBuscarPublicacaoPorId() {
        String publicacaoId = cadastrarPublicacaoAuxiliar();

        Response response = given().spec(specification)
                .pathParam("id", publicacaoId)
                .when()
                .get("/{id}")
                .then()
                .statusCode(200)
                .extract()
                .response();

        assertThat(response.jsonPath().getString("id")).isEqualTo(publicacaoId);
        assertThat(response.jsonPath().getString("titulo")).isEqualTo("Gatinha Perdida");
    }

    @Test
    @DisplayName("PublicacaoControllerTest: Deve listar as publicações no feed retornando 200 OK")
    void deveListarTodasAsPublicacoes() {
        cadastrarPublicacaoAuxiliar();

        Response response = given().spec(specification)
                .when()
                .get()
                .then()
                .statusCode(200)
                .extract()
                .response();

        assertThat(response.jsonPath().getList("")).isNotEmpty();
    }

    @Test
    @DisplayName("PublicacaoControllerTest: Deve atualizar a publicação retornando 200 OK")
    void deveAtualizarPublicacaoComSucesso() {
        String publicacaoId = cadastrarPublicacaoAuxiliar();

        EnderecoDto novoEndereco = new EnderecoDto("SC", "Tubarão", "Centro", "Rua X", "Sem Complemento");
        PublicacaoRequest requestAtualizado = new PublicacaoRequest(
                "Gatinha Para Adoção", "Procurando um lar responsável",
                TipoPublicacao.ADOCAO, UUID.fromString(animalId), novoEndereco
        );

        Response response = given().spec(specification)
                .header(TestConfigs.HEADER_PARAM_AUTHORIZATION, bearerToken)
                .contentType(MediaType.MULTIPART_FORM_DATA_VALUE)
                .multiPart("dados", requestAtualizado, APPLICATION_JSON_UTF8)
                .pathParam("id", publicacaoId)
                .when()
                .put("/{id}")
                .then()
                .statusCode(200)
                .extract()
                .response();

        assertThat(response.jsonPath().getString("titulo")).isEqualTo("Gatinha Para Adoção");
        assertThat(response.jsonPath().getString("tipo")).isEqualTo(TipoPublicacao.ADOCAO.name());
        assertThat(response.jsonPath().getString("fotoUrl")).isEqualTo(FOTO_ANIMAL_MOCK);
    }

    @Test
    @DisplayName("PublicacaoControllerTest: Deve alterar o status da publicação (ex: para RESOLVIDO)")
    void deveAlterarStatusDaPublicacao() {
        String publicacaoId = cadastrarPublicacaoAuxiliar();

        Response response = given().spec(specification)
                .header(TestConfigs.HEADER_PARAM_AUTHORIZATION, bearerToken)
                .pathParam("id", publicacaoId)
                .queryParam("status", StatusPublicacao.RESOLVIDO.name())
                .when()
                .patch("/{id}/status")
                .then()
                .statusCode(200)
                .extract()
                .response();

        assertThat(response.jsonPath().getString("status")).isEqualTo(StatusPublicacao.RESOLVIDO.name());
    }

    @Test
    @DisplayName("PublicacaoControllerTest: Deve excluir a publicação com sucesso retornando 204 No Content")
    void deveExcluirPublicacaoComSucesso() {
        String publicacaoId = cadastrarPublicacaoAuxiliar();

        given().spec(specification)
                .header(TestConfigs.HEADER_PARAM_AUTHORIZATION, bearerToken)
                .pathParam("id", publicacaoId)
                .when()
                .delete("/{id}")
                .then()
                .statusCode(204);

        // Verifica a deleção buscando o ID diretamente na especificação (que já contém o basePath)
        given().spec(specification)
                .pathParam("id", publicacaoId)
                .when()
                .get("/{id}")
                .then()
                .statusCode(404);
    }

    // Método auxiliar para criar uma publicação via multipart/form-data e retornar o ID
    private String cadastrarPublicacaoAuxiliar() {
        return given().spec(specification)
                .header(TestConfigs.HEADER_PARAM_AUTHORIZATION, bearerToken)
                .contentType(MediaType.MULTIPART_FORM_DATA_VALUE)
                .multiPart("dados", publicacaoRequestPadrao, APPLICATION_JSON_UTF8)
                .when()
                .post()
                .then()
                .statusCode(201)
                .extract()
                .jsonPath().getString("id");
    }
}