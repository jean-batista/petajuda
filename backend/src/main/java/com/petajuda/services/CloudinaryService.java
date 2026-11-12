package com.petajuda.services;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.petajuda.exceptions.RegraDeNegocioException;

@Service
public class CloudinaryService {

    private static final Logger logger = LoggerFactory.getLogger(CloudinaryService.class);
    private final Cloudinary cloudinary;

    private static final List<String> EXTENSOES_PERMITIDAS = Arrays.asList(
            "image/jpeg", "image/png", "image/webp", "image/jpg"
    );

    public CloudinaryService(Cloudinary cloudinary) {
        this.cloudinary = cloudinary;
    }

    /**
     * Envia uma imagem para a nuvem do Cloudinary e retorna a URL HTTPS segura.
     */
    public String enviarFoto(MultipartFile arquivo, String pasta) {
        validarArquivo(arquivo);

        try {
            String publicId = "petajuda/" + pasta + "/" + UUID.randomUUID().toString();

            Map<?, ?> resultado = cloudinary.uploader().upload(
                    arquivo.getBytes(),
                    ObjectUtils.asMap(
                            "public_id", publicId,
                            "overwrite", true,
                            "resource_type", "image"
                    )
            );

            return resultado.get("secure_url").toString();

        } catch (IOException e) {
            throw new RegraDeNegocioException("Falha ao realizar o upload da imagem para o servidor de mídias.");
        }
    }

    /**
     * Exclui uma imagem da nuvem do Cloudinary a partir da URL salva no banco de dados.
     * Falhas na remoção externa são apenas logadas para não travar a exclusão principal no banco.
     */
    public void excluirFoto(String fotoUrl) {
        if (fotoUrl == null || fotoUrl.isBlank() || !fotoUrl.contains("res.cloudinary.com")) {
            return; // Ignora se for nula ou se for URL mockada de testes antigos
        }

        try {
            String publicId = extrairPublicIdDaUrl(fotoUrl);
            if (publicId != null) {
                cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
                logger.info("Imagem removida do Cloudinary com sucesso. Public ID: {}", publicId);
            }
        } catch (Exception e) {
            logger.warn("Não foi possível excluir a imagem órfã no Cloudinary ({}): {}", fotoUrl, e.getMessage());
        }
    }

    /**
     * Extrai o public_id de uma URL padrão do Cloudinary.
     * Ex: "https://res.cloudinary.com/cloud/image/upload/v17944/petajuda/animais/abc.jpg" -> "petajuda/animais/abc"
     */
    private String extrairPublicIdDaUrl(String url) {
        // Regex captura tudo que vem após "/upload/(v123456/)?" até antes da extensão (.jpg, .png, etc.)
        Pattern pattern = Pattern.compile("/upload/(?:v\\d+/)?(.+)\\.[a-zA-Z0-9]+$");
        Matcher matcher = pattern.matcher(url);

        if (matcher.find()) {
            return matcher.group(1);
        }
        return null;
    }

    private void validarArquivo(MultipartFile arquivo) {
        if (arquivo == null || arquivo.isEmpty()) {
            throw new RegraDeNegocioException("É necessário fornecer um arquivo de imagem válido.");
        }

        String contentType = arquivo.getContentType();
        if (contentType == null || !EXTENSOES_PERMITIDAS.contains(contentType.toLowerCase())) {
            throw new RegraDeNegocioException("Formato de arquivo inválido. Apenas imagens (JPEG, PNG, WEBP) são permitidas.");
        }
    }
}