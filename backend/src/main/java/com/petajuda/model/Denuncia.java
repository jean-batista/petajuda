package com.petajuda.model;

import java.time.LocalDateTime;
import java.util.UUID;

import org.hibernate.annotations.CreationTimestamp;

import com.petajuda.enums.StatusDenuncia;

import jakarta.persistence.Column;
import jakarta.persistence.Embedded;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "tabela_denuncia")
public class Denuncia {
    
    // Identificador unico da denuncia
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    // Titulo da denuncia
    @Column(name = "titulo", nullable = false, length = 100)
    private String titulo;

    // Descricao da denuncia
    @Column(name = "descricao", nullable = false, columnDefinition = "TEXT")
    private String descricao;

    // Foto da denuncia
    @Column(name = "foto_url", nullable = false, columnDefinition = "TEXT")
    private String fotoUrl;

    // Data da denuncia
    @CreationTimestamp
    @Column(name = "data", nullable = false)
    private LocalDateTime data;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 50)
    private StatusDenuncia status;

    @Embedded
    private Endereco endereco;

    // Construtor sem argumentos
    public Denuncia() {
    }

    // Construtor com argumentos
    public Denuncia(UUID id, String titulo, String descricao, String fotoUrl, LocalDateTime data,
            StatusDenuncia status, Endereco endereco) {
        this.id = id;
        this.titulo = titulo;
        this.descricao = descricao;
        this.fotoUrl = fotoUrl;
        this.data = data;
        this.status = status;
        this.endereco = endereco;
    }

    // Getters

    public UUID getId() {
        return id;
    }

    public String getTitulo() {
        return titulo;
    }

    public String getDescricao() {
        return descricao;
    }

    public String getFotoUrl() {
        return fotoUrl;
    }

    public LocalDateTime getData() {
        return data;
    }

    public StatusDenuncia getStatus() {
        return status;
    }

    public Endereco getEndereco() {
        return endereco;
    }

    // Setters

    public void setId(UUID id) {
        this.id = id;
    }

    public void setTitulo(String titulo) {
        this.titulo = titulo;
    }

    public void setDescricao(String descricao) {
        this.descricao = descricao;
    }

    public void setFotoUrl(String fotoUrl) {
        this.fotoUrl = fotoUrl;
    }

    public void setData(LocalDateTime data) {
        this.data = data;
    }

    public void setStatus(StatusDenuncia status) {
        this.status = status;
    }

    public void setEndereco(Endereco endereco) {
        this.endereco = endereco;
    }

    // Hashcode e equals

    @Override
    public int hashCode() {
        final int prime = 31;
        int result = 1;
        result = prime * result + ((id == null) ? 0 : id.hashCode());
        return result;
    }

    @Override
    public boolean equals(Object obj) {
        if (this == obj)
            return true;
        if (obj == null)
            return false;
        if (getClass() != obj.getClass())
            return false;
        Denuncia other = (Denuncia) obj;
        if (id == null) {
            if (other.id != null)
                return false;
        } else if (!id.equals(other.id))
            return false;
        return true;
    }

}
