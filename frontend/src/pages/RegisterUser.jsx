import React, { useState } from 'react';
import { PawPrint } from 'lucide-react';

export default function RegisterUser() {
    const [formData, setFormData] = useState({
        nome: '',
        sobrenome: '',
        email: '',
        telefone: '',
        senha: '',
        confirmarSenha: '',
        termos: false,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (formData.senha !== formData.confirmarSenha) {
            alert('As senhas não coincidem!');
            return;
        }
        console.log('Cadastro Usuário:', formData);
        alert('Cadastro realizado com sucesso!');
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="flex justify-center text-orange-600">
                    <PawPrint className="w-12 h-12" />
                </div>
                <h2 className="mt-4 text-center text-3xl font-extrabold text-slate-900">
                    Criar sua conta
                </h2>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-slate-100">
                    <form className="space-y-4" onSubmit={handleSubmit}>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Nome</label>
                                <input
                                    type="text"
                                    required
                                    className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Sobrenome</label>
                                <input
                                    type="text"
                                    required
                                    className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                                    onChange={(e) => setFormData({ ...formData, sobrenome: e.target.value })}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700">E-mail</label>
                            <input
                                type="email"
                                required
                                className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700">Telefone / WhatsApp</label>
                            <input
                                type="text"
                                placeholder="(48) 99999-9999"
                                required
                                className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                                onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700">Senha</label>
                            <input
                                type="password"
                                required
                                className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                                onChange={(e) => setFormData({ ...formData, senha: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700">Confirmação de Senha</label>
                            <input
                                type="password"
                                required
                                className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                                onChange={(e) => setFormData({ ...formData, confirmarSenha: e.target.value })}
                            />
                        </div>

                        <div className="flex items-center pt-2">
                            <input
                                type="checkbox"
                                required
                                className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-slate-300 rounded"
                                onChange={(e) => setFormData({ ...formData, termos: e.target.checked })}
                            />
                            <label className="ml-2 block text-xs text-slate-600">
                                Concordo com os <a href="#" className="text-orange-600 underline">Termos de Uso</a> e Política de Privacidade.
                            </label>

                        </div>




                        <button
                            type="submit"
                            className="w-full mt-2 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 transition-colors"
                        >
                            Concluir Cadastro
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}