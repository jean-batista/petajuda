package com.petajuda.services;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.petajuda.exceptions.RegraDeNegocioException;

@Service
public class CloudinaryService {

    private final Cloudinary cloudinary;

    // Extensões de imagem permitidas na plataforma
    private static final List<String> EXTENSOES_PERMITIDAS = Arrays.asList(
            "image/jpeg", "image/png", "image/webp", "image/jpg"
    );

    public CloudinaryService(Cloudinary cloudinary) {
        this.cloudinary = cloudinary;
    }

    /**
     * Envia uma imagem para a nuvem do Cloudinary.
     *
     * @param arquivo Arquivo de imagem enviado via MultipartFile
     * @param pasta Subpasta de destino dentro do Cloudinary (ex: "perfis", "animais", "denuncias")
     * @return String da URL HTTPS segura gerada pelo Cloudinary
     */
    public String enviarFoto(MultipartFile arquivo, String pasta) {
        validarArquivo(arquivo);

        try {
            // Gera um ID público único para não sobrescrever arquivos existentes com o mesmo nome
            String publicId = "petajuda/" + pasta + "/" + UUID.randomUUID().toString();

            Map<?, ?> resultado = cloudinary.uploader().upload(
                    arquivo.getBytes(),
                    ObjectUtils.asMap(
                            "public_id", publicId,
                            "overwrite", true,
                            "resource_type", "image"
                    )
            );

            // Retorna a URL segura (HTTPS) gerada automaticamente pela CDN do Cloudinary
            return resultado.get("secure_url").toString();

        } catch (IOException e) {
            throw new RegraDeNegocioException("Falha ao realizar o upload da imagem para o servidor de mídias.");
        }
    }

    /**
     * Valida se o arquivo enviado não é nulo/vazio e se possui extensão de imagem suportada.
     */
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