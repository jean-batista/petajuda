package com.petajuda.integrationtests.controllers;

import com.petajuda.configs.TestConfigs;
import com.petajuda.dtos.EnderecoDto;
import com.petajuda.dtos.request.AnimalRequest;
import com.petajuda.dtos.request.UsuarioCredenciaisRequest;
import com.petajuda.dtos.request.UsuarioInfoRequest;
import com.petajuda.enums.EspecieAnimal;
import com.petajuda.enums.IdadeAnimal;
import com.petajuda.enums.PorteAnimal;
import com.petajuda.integrationtests.AbstractIntegrationTest;
import com.petajuda.services.CloudinaryService;
import io.restassured.builder.RequestSpecBuilder;
import io.restassured.filter.log.LogDetail;
import io.restassured.filter.log.RequestLoggingFilter;
import io.restassured.filter.log.ResponseLoggingFilter;
import io.restassured.response.Response;
import io.restassured.specification.RequestSpecification;
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
public class AnimalControllerTest extends AbstractIntegrationTest {

    private static final String FOTO_URL_MOCK = "https://res.cloudinary.com/demo/image/upload/v1/petajuda/animais/rex.jpg";

    @LocalServerPort
    private int port;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    // Mocka o serviço externo do Cloudinary no contexto do Spring Boot para evitar chamadas reais de rede
    // (Nota: Caso utilize Spring Boot anterior à versão 3.4, substitua @MockitoBean por @MockBean)
    @MockitoBean
    private CloudinaryService cloudinaryService;

    private String bearerToken;
    private AnimalRequest animalRequestPadrao;
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
        // Limpa as tabelas principais e as dependentes (cascade) para garantir isolamento
        jdbcTemplate.execute("TRUNCATE TABLE tabela_usuario, tabela_denuncia CASCADE;");
    }

    @BeforeEach
    void setUp() {
        // Configura o comportamento padrão do mock do Cloudinary antes de cada teste
        when(cloudinaryService.enviarFoto(any(), eq("animais"))).thenReturn(FOTO_URL_MOCK);

        // Inicializa a specification para ser reaproveitada nos testes do AnimalController
        specification = new RequestSpecBuilder()
                .setBasePath(TestConfigs.ANIMAL_CONTROLLER_BASE_PATH)
                .setPort(this.port)
                .addFilter(new RequestLoggingFilter(LogDetail.ALL))
                .addFilter(new ResponseLoggingFilter(LogDetail.ALL))
                .build();

        // 1. Cria um usuário único para isolar o contexto de cada teste
        String sufixoUnico = UUID.randomUUID().toString().substring(0, 8);
        String email = "dono.animal." + sufixoUnico + "@email.com";
        String telefone = "489" + sufixoUnico;
        String senha = "senhaSegura123";

        EnderecoDto enderecoUsuario = new EnderecoDto("SC", "Tubarão", "Centro", "Rua Lauro Müller", "Apto 202");
        UsuarioInfoRequest usuarioRequest = new UsuarioInfoRequest(
                "Carlos", "Medeiros", telefone, LocalDate.of(1992, 8, 20), email, senha, enderecoUsuario
        );

        // Cadastra o usuário chamando a API real (sem a spec do Animal)
        given()
                .port(port)
                .filter(new RequestLoggingFilter(LogDetail.ALL))
                .filter(new ResponseLoggingFilter(LogDetail.ALL))
                .contentType(TestConfigs.CONTENT_TYPE_JSON)
                .body(usuarioRequest)
                .when()
                .post(TestConfigs.AUTENTICACAO_CONTROLLER_BASE_PATH + "/cadastro")
                .then()
                .statusCode(201);

        // 2. Faz o login e extrai o Token JWT
        UsuarioCredenciaisRequest credenciais = new UsuarioCredenciaisRequest(email, senha);

        String token = given()
                .port(port)
                .filter(new RequestLoggingFilter(LogDetail.ALL))
                .filter(new ResponseLoggingFilter(LogDetail.ALL))
                .contentType(TestConfigs.CONTENT_TYPE_JSON)
                .body(credenciais)
                .when()
                .post(TestConfigs.AUTENTICACAO_CONTROLLER_BASE_PATH + "/login")
                .then()
                .statusCode(200)
                .extract()
                .jsonPath().getString("token");

        this.bearerToken = "Bearer " + token;

        // 3. Inicializa um DTO de requisição padrão de Animal para reaproveitar nos testes
        this.animalRequestPadrao = new AnimalRequest(
                "Rex", "Macho", "Caramelo", true, true,
                "Cachorro muito dócil encontrado na rua",
                IdadeAnimal.ADULTO, PorteAnimal.MEDIO, EspecieAnimal.CACHORRO
        );
    }

    @Test
    @DisplayName("AnimalControllerTest: Deve cadastrar um animal com foto via multipart/form-data retornando 201 Created")
    void deveCadastrarAnimalComSucesso() {
        Response response = given().spec(specification)
                .header(TestConfigs.HEADER_PARAM_AUTHORIZATION, bearerToken)
                .contentType(MediaType.MULTIPART_FORM_DATA_VALUE)
                .multiPart("dados", animalRequestPadrao, MediaType.APPLICATION_JSON_VALUE)
                .multiPart("foto", "rex.jpg", "conteudo_imagem_simulada".getBytes(), MediaType.IMAGE_JPEG_VALUE)
                .when()
                .post()
                .then()
                .statusCode(201)
                .extract()
                .response();

        String id = response.jsonPath().getString("id");
        String nome = response.jsonPath().getString("nome");
        String fotoUrl = response.jsonPath().getString("fotoUrl");

        assertThat(id).isNotNull();
        assertThat(nome).isEqualTo("Rex");
        assertThat(fotoUrl).isEqualTo(FOTO_URL_MOCK);
        assertThat(response.header("Location")).contains(TestConfigs.ANIMAL_CONTROLLER_BASE_PATH + "/" + id);
    }

    @Test
    @DisplayName("AnimalControllerTest: Deve buscar um animal específico por ID retornando 200 OK")
    void deveBuscarAnimalPorIdComSucesso() {
        // Primeiro cadastra o animal
        String animalId = cadastrarAnimalAuxiliarEObterId();

        // Depois busca ele
        Response response = given().spec(specification)
                .header(TestConfigs.HEADER_PARAM_AUTHORIZATION, bearerToken)
                .contentType(TestConfigs.CONTENT_TYPE_JSON)
                .pathParam("id", animalId)
                .when()
                .get("/{id}")
                .then()
                .statusCode(200)
                .extract()
                .response();

        assertThat(response.jsonPath().getString("id")).isEqualTo(animalId);
        assertThat(response.jsonPath().getString("nome")).isEqualTo("Rex");
        assertThat(response.jsonPath().getString("fotoUrl")).isEqualTo(FOTO_URL_MOCK);
    }

    @Test
    @DisplayName("AnimalControllerTest: Deve retornar 403/401 ao tentar cadastrar um animal sem token JWT")
    void deveRetornarErroAoCadastrarSemAutenticacao() {
        given().spec(specification)
                .contentType(MediaType.MULTIPART_FORM_DATA_VALUE)
                .multiPart("dados", animalRequestPadrao, MediaType.APPLICATION_JSON_VALUE)
                .multiPart("foto", "rex.jpg", "conteudo_imagem_simulada".getBytes(), MediaType.IMAGE_JPEG_VALUE)
                .when()
                .post()
                .then()
                .statusCode(org.hamcrest.Matchers.anyOf(org.hamcrest.Matchers.is(401), org.hamcrest.Matchers.is(403)));
    }

    @Test
    @DisplayName("AnimalControllerTest: Deve atualizar os dados do animal mantendo a foto atual quando nova foto não for enviada")
    void deveAtualizarAnimalComSucesso() {
        String animalId = cadastrarAnimalAuxiliarEObterId();

        AnimalRequest atualizarRequest = new AnimalRequest(
                "Rex Atualizado", "Macho", "Preto", true, true,
                "Descrição atualizada",
                IdadeAnimal.IDOSO, PorteAnimal.GRANDE, EspecieAnimal.CACHORRO
        );

        // Envia apenas a parte "dados" (testando o required = false da parte "foto")
        Response response = given().spec(specification)
                .header(TestConfigs.HEADER_PARAM_AUTHORIZATION, bearerToken)
                .contentType(MediaType.MULTIPART_FORM_DATA_VALUE)
                .multiPart("dados", atualizarRequest, MediaType.APPLICATION_JSON_VALUE)
                .pathParam("id", animalId)
                .when()
                .put("/{id}")
                .then()
                .statusCode(200)
                .extract()
                .response();

        assertThat(response.jsonPath().getString("nome")).isEqualTo("Rex Atualizado");
        assertThat(response.jsonPath().getString("idade")).isEqualTo(IdadeAnimal.IDOSO.name());
        assertThat(response.jsonPath().getString("fotoUrl")).isEqualTo(FOTO_URL_MOCK);
    }

    @Test
    @DisplayName("AnimalControllerTest: Deve excluir um animal com sucesso retornando 204 No Content e limpar foto na nuvem")
    void deveExcluirAnimalComSucesso() {
        String animalId = cadastrarAnimalAuxiliarEObterId();

        given().spec(specification)
                .header(TestConfigs.HEADER_PARAM_AUTHORIZATION, bearerToken)
                .pathParam("id", animalId)
                .when()
                .delete("/{id}")
                .then()
                .statusCode(204);

        // Garante que o serviço acionou a exclusão da imagem órfã no Cloudinary
        verify(cloudinaryService).excluirFoto(FOTO_URL_MOCK);

        // Verifica se realmente foi excluído no banco (tentando buscar pelo id)
        given().spec(specification)
                .header(TestConfigs.HEADER_PARAM_AUTHORIZATION, bearerToken)
                .pathParam("id", animalId)
                .when()
                .get("/{id}")
                .then()
                .statusCode(404);
    }

    // Método auxiliar para criar um animal via multipart/form-data e retornar o ID formatado como String
    private String cadastrarAnimalAuxiliarEObterId() {
        return given().spec(specification)
                .header(TestConfigs.HEADER_PARAM_AUTHORIZATION, bearerToken)
                .contentType(MediaType.MULTIPART_FORM_DATA_VALUE)
                .multiPart("dados", animalRequestPadrao, MediaType.APPLICATION_JSON_VALUE)
                .multiPart("foto", "rex.jpg", "conteudo_imagem_simulada".getBytes(), MediaType.IMAGE_JPEG_VALUE)
                .when()
                .post()
                .then()
                .statusCode(201)
                .extract()
                .jsonPath().getString("id");
    }
}