import React, { useState } from 'react';
import { PlusCircle, Upload, X } from 'lucide-react';

export default function NovaPublicacao() {
    const [etapa, setEtapa] = useState(1);
    const [tipoPost, setTipoPost] = useState('Perdido');
    const [imagemPreview, setImagemPreview] = useState(null);
    const [formData, setFormData] = useState({
        nome: '',
        especie: 'Cão',
        porte: 'Pequeno',
        sexo: 'Macho',
        cidade: 'Tubarão',
        bairro: '',
        descricao: '',
    });

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const previewUrl = URL.createObjectURL(file);
            setImagemPreview(previewUrl);
        }
    };

    const handleRemoveImage = () => {
        setImagemPreview(null);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Publicação enviada:', { ...formData, tipoPost, imagemPreview });
        alert('Publicação criada com sucesso!');
    };

    return (
        <div className="max-w-3xl mx-auto py-10 px-4 sm:px-6">
            <div className="bg-white shadow rounded-lg p-6 border border-slate-100">
                <div className="border-b border-slate-200 pb-4 mb-6">
                    <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                        <PlusCircle className="text-orange-600" /> Cadastrar Animal ou Ocorrência
                    </h2>
                    <p className="text-sm text-slate-500">Etapa {etapa} de 2 — {etapa === 1 ? 'Ficha do Pet' : 'Dados da Publicação'}</p>
                </div>

                <form onSubmit={handleSubmit}>
                    {etapa === 1 ? (
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700">Nome ou Apelido</label>
                                    <input
                                        type="text"
                                        placeholder="Ex: Mel, Bob, ou 'Não identificado'"
                                        value={formData.nome}
                                        onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                                        className="mt-1 w-full p-2 border border-slate-300 rounded-md text-sm focus:ring-orange-500 focus:border-orange-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700">Espécie</label>
                                    <select
                                        value={formData.especie}
                                        onChange={(e) => setFormData({ ...formData, especie: e.target.value })}
                                        className="mt-1 w-full p-2 border border-slate-300 rounded-md text-sm bg-white focus:ring-orange-500 focus:border-orange-500"
                                    >
                                        <option>Cão</option>
                                        <option>Gato</option>
                                        <option>Pássaro</option>
                                        <option>Outro</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700">Porte</label>
                                    <select
                                        value={formData.porte}
                                        onChange={(e) => setFormData({ ...formData, porte: e.target.value })}
                                        className="mt-1 w-full p-2 border border-slate-300 rounded-md text-sm bg-white focus:ring-orange-500 focus:border-orange-500"
                                    >
                                        <option>Pequeno</option>
                                        <option>Médio</option>
                                        <option>Grande</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700">Sexo</label>
                                    <select
                                        value={formData.sexo}
                                        onChange={(e) => setFormData({ ...formData, sexo: e.target.value })}
                                        className="mt-1 w-full p-2 border border-slate-300 rounded-md text-sm bg-white focus:ring-orange-500 focus:border-orange-500"
                                    >
                                        <option>Macho</option>
                                        <option>Fêmea</option>
                                        <option>Não sei</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Foto do Animal</label>
                                {imagemPreview ? (
                                    <div className="relative w-full h-48 bg-slate-100 rounded-md overflow-hidden border border-slate-300 flex items-center justify-center">
                                        <img src={imagemPreview} alt="Preview do pet" className="h-full object-contain" />
                                        <button
                                            type="button"
                                            onClick={handleRemoveImage}
                                            className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full hover:bg-red-700 transition-colors"
                                            title="Remover foto"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ) : (
                                    <label className="border-2 border-dashed border-slate-300 rounded-md p-6 text-center hover:bg-slate-50 cursor-pointer block">
                                        <Upload className="mx-auto h-12 w-12 text-slate-400" />
                                        <span className="text-sm text-slate-600 mt-1 block">Arraste uma foto clara ou clique para selecionar</span>
                                        <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                                    </label>
                                )}
                            </div>

                            <div className="flex justify-end pt-4">
                                <button
                                    type="button"
                                    onClick={() => setEtapa(2)}
                                    className="bg-orange-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-orange-700 transition-colors"
                                >
                                    Próxima Etapa
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Tipo de Publicação</label>
                                <div className="grid grid-cols-3 gap-3 mt-1">
                                    {['Perdido', 'Encontrado', 'Adoção'].map((tipo) => (
                                        <button
                                            key={tipo}
                                            type="button"
                                            onClick={() => setTipoPost(tipo)}
                                            className={`p-3 border rounded-md text-center text-sm font-medium transition-colors ${tipoPost === tipo
                                                    ? 'border-orange-500 bg-orange-50 text-orange-700'
                                                    : 'border-slate-300 text-slate-700 hover:bg-slate-50'
                                                }`}
                                        >
                                            {tipo}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700">Cidade (Região da AMUREL)</label>
                                    <select
                                        value={formData.cidade}
                                        onChange={(e) => setFormData({ ...formData, cidade: e.target.value })}
                                        className="mt-1 w-full p-2 border border-slate-300 rounded-md text-sm bg-white focus:ring-orange-500 focus:border-orange-500"
                                    >
                                        <option>Tubarão</option>
                                        <option>Laguna</option>
                                        <option>Capivari de Baixo</option>
                                        <option>Gravatal</option>
                                        <option>Imbituba</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700">Bairro</label>
                                    <input
                                        type="text"
                                        placeholder="Ex: Oficinas, Centro, Magalhães..."
                                        value={formData.bairro}
                                        onChange={(e) => setFormData({ ...formData, bairro: e.target.value })}
                                        className="mt-1 w-full p-2 border border-slate-300 rounded-md text-sm focus:ring-orange-500 focus:border-orange-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700">Descrição e Detalhes</label>
                                <textarea
                                    rows={4}
                                    placeholder="Conte onde foi visto, características marcantes, ponto de referência..."
                                    value={formData.descricao}
                                    onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                                    className="mt-1 w-full p-2 border border-slate-300 rounded-md text-sm focus:ring-orange-500 focus:border-orange-500"
                                ></textarea>
                            </div>

                            <div className="flex justify-between pt-4">
                                <button
                                    type="button"
                                    onClick={() => setEtapa(1)}
                                    className="bg-slate-200 text-slate-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-slate-300 transition-colors"
                                >
                                    Voltar
                                </button>
                                <button
                                    type="submit"
                                    className="bg-orange-600 text-white px-6 py-2 rounded-md text-sm font-medium hover:bg-orange-700 transition-colors"
                                >
                                    Publicar Animal
                                </button>
                            </div>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
}