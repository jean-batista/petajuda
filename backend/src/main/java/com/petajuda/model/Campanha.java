package com.petajuda.model;

import java.time.LocalDateTime;
import java.util.UUID;

import org.springframework.format.annotation.DateTimeFormat;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "tabela_campanha")
public class Campanha {
    
    // Identificador unico da campanha
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    // Titulo da campanha
    @Column(name = "titulo", nullable = false, length = 100)
    private String titulo;

    // Descricao da campanha
    @Column(name = "descricao", nullable = false, columnDefinition = "TEXT")
    private String descricao;

    // Inicio da campanha
    @DateTimeFormat
    @Column(name = "inicio", nullable = false, length = 50)
    private LocalDateTime inicio;
    
    // Fim da campanha
    @DateTimeFormat
    @Column(name = "fim", nullable = false, length = 50)
    private LocalDateTime fim;
    
    // Indentificador se a camanha esta ativa
    @Column(name = "ativo", nullable = false, length = 10)
    private Boolean ativo;

    // Ong vinculada a camapanha
    @ManyToOne
    @JoinColumn(name = "ong_id", nullable = false)
    private Ong ong;

    // Construtor sem argumentos
    public Campanha() {
    }

    // Construtor com argumentos
    public Campanha(UUID id, String titulo, String descricao, LocalDateTime inicio, LocalDateTime fim, Boolean ativo,
            Ong ong) {
        this.id = id;
        this.titulo = titulo;
        this.descricao = descricao;
        this.inicio = inicio;
        this.fim = fim;
        this.ativo = ativo;
        this.ong = ong;
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

    public LocalDateTime getInicio() {
        return inicio;
    }

    public LocalDateTime getFim() {
        return fim;
    }

    public Boolean getAtivo() {
        return ativo;
    }

    public Ong getOng() {
        return ong;
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

    public void setInicio(LocalDateTime inicio) {
        this.inicio = inicio;
    }

    public void setFim(LocalDateTime fim) {
        this.fim = fim;
    }

    public void setAtivo(Boolean ativo) {
        this.ativo = ativo;
    }

    public void setOng(Ong ong) {
        this.ong = ong;
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
        Campanha other = (Campanha) obj;
        if (id == null) {
            if (other.id != null)
                return false;
        } else if (!id.equals(other.id))
            return false;
        return true;
    }

}
