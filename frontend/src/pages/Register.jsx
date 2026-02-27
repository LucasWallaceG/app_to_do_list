import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserPlus } from 'lucide-react';

const Register = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await register({ username, email, password });
            navigate('/login');
        } catch (err) {
            setError('Erro ao cadastrar. Verifique os dados e tente novamente.');
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-header">
                    <UserPlus size={48} className="auth-icon" />
                    <h1>Criar Conta</h1>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label>Usuário</label>
                        <input
                            name="username"
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>
                    <div className="input-group">
                        <label>Email</label>
                        <input
                            name="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="input-group">
                        <label>Senha</label>
                        <input
                            name="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    {error && <p className="error-message">{error}</p>}
                    <button type="submit" className="auth-button">Cadastrar</button>
                </form>
                <p className="auth-footer">
                    Já tem uma conta? <Link to="/login">Entrar</Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
