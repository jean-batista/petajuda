package com.petajuda.model;

import java.time.LocalDateTime;
import java.util.UUID;

import org.hibernate.annotations.CreationTimestamp;

import com.petajuda.enums.StatusPublicacao;
import com.petajuda.enums.TipoPublicacao;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "tabela_publicacao")
public class Publicacao {
    
    // Identificador unico da publicacao
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    // Titulo da publicacao
    @Column(name = "titulo", nullable = false, length = 50)
    private String titulo;

    // Descricacao da publicacao
    @Column(name = "descricao", nullable = false, columnDefinition = "TEXT")
    private String descricao;

    // Data da publicacao
    @CreationTimestamp
    @Column(name = "data", nullable = false)
    private LocalDateTime data;

    // Status da publicacao
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 50)
    private StatusPublicacao status;

    // Tipo da publicacao
    @Enumerated(EnumType.STRING)
    @Column(name = "tipo", nullable = false, length = 50)
    private TipoPublicacao tipo;

    // Usuario vinculado a publicacao
    @ManyToOne(fetch = FetchType.EAGER)
    @Column(name = "usuario", nullable = false, length = 50)
    private Usuario usuario;
    
    // Animal vinculado a publicacao
    @ManyToOne(fetch = FetchType.EAGER)
    @Column(name = "animal", nullable = false, length = 50)
    private Animal animal;
    
    // Endereco vinculado a publicacao
    @Column(name = "endereco", nullable = false, length = 50)
    private Endereco endereco;

    // Construtor sem argumentos
    public Publicacao() {
    }

    // Construtor com argumentos
    public Publicacao(UUID id, String titulo, String descricao, LocalDateTime data, StatusPublicacao status,
            TipoPublicacao tipo, Usuario usuario, Animal animal, Endereco endereco) {
        this.id = id;
        this.titulo = titulo;
        this.descricao = descricao;
        this.data = data;
        this.status = status;
        this.tipo = tipo;
        this.usuario = usuario;
        this.animal = animal;
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

    public LocalDateTime getData() {
        return data;
    }

    public StatusPublicacao getStatus() {
        return status;
    }

    public TipoPublicacao getTipo() {
        return tipo;
    }

    public Usuario getUsuario() {
        return usuario;
    }

    public Animal getAnimal() {
        return animal;
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

    public void setData(LocalDateTime data) {
        this.data = data;
    }

    public void setStatus(StatusPublicacao status) {
        this.status = status;
    }

    public void setTipo(TipoPublicacao tipo) {
        this.tipo = tipo;
    }

    public void setUsuario(Usuario usuario) {
        this.usuario = usuario;
    }

    public void setAnimal(Animal animal) {
        this.animal = animal;
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
        Publicacao other = (Publicacao) obj;
        if (id == null) {
            if (other.id != null)
                return false;
        } else if (!id.equals(other.id))
            return false;
        return true;
    }

    

}
