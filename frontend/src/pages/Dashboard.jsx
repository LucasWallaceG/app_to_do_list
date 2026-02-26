import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
    Plus,
    Trash2,
    CheckCircle,
    Circle,
    Folder,
    Share2,
    LogOut,
    Filter,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';

const Dashboard = () => {
    const { user, logout } = useAuth();
    const [tasks, setTasks] = useState([]);
    const [categories, setCategories] = useState([]);
    const [newTask, setNewTask] = useState({ title: '', category: '' });
    const [newCategory, setNewCategory] = useState({ name: '', color: '#6366f1' });
    const [sharingTask, setSharingTask] = useState(null);
    const [userSearch, setUserSearch] = useState('');
    const [users, setUsers] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [filter, setFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');

    useEffect(() => {
        fetchData();
    }, [page, filter, statusFilter]);

    useEffect(() => {
        if (userSearch) {
            const timeout = setTimeout(searchUsers, 300);
            return () => clearTimeout(timeout);
        } else {
            setUsers([]);
        }
    }, [userSearch]);

    const fetchData = async () => {
        try {
            const [tasksRes, catsRes] = await Promise.all([
                api.get(`/tasks/?page=${page}&search=${filter}&completed=${statusFilter}`),
                api.get('/categories/')
            ]);
            setTasks(tasksRes.data.results);
            setTotalPages(Math.ceil(tasksRes.data.count / 10));
            setCategories(catsRes.data.results);
        } catch (err) {
            console.error("Error fetching data", err);
        }
    };

    const searchUsers = async () => {
        try {
            const res = await api.get(`/users/?search=${userSearch}`);
            setUsers(res.data.results.filter(u => u.id !== user.user_id));
        } catch (err) {
            console.error(err);
        }
    };

    const handleShare = async (toUserId) => {
        try {
            const currentShared = sharingTask.shared_with || [];
            if (currentShared.includes(toUserId)) {
                alert('Tarefa já compartilhada com este usuário.');
                return;
            }
            await api.patch(`/tasks/${sharingTask.id}/`, {
                shared_with: [...currentShared, toUserId]
            });
            alert('Tarefa compartilhada com sucesso!');
            setSharingTask(null);
            setUserSearch('');
            fetchData();
        } catch (err) {
            alert('Erro ao compartilhar tarefa.');
        }
    };

    const handleCreateTask = async (e) => {
        e.preventDefault();
        try {
            await api.post('/tasks/', newTask);
            setNewTask({ title: '', category: '' });
            fetchData();
        } catch (err) {
            alert('Erro ao criar tarefa.');
        }
    };

    const handleCreateCategory = async (e) => {
        e.preventDefault();
        try {
            await api.post('/categories/', newCategory);
            setNewCategory({ name: '', color: '#6366f1' });
            fetchData();
        } catch (err) {
            alert('Erro ao criar categoria.');
        }
    };

    const toggleTask = async (task) => {
        try {
            await api.patch(`/tasks/${task.id}/`, { completed: !task.completed });
            fetchData();
        } catch (err) {
            console.error(err);
        }
    };

    const deleteTask = async (id) => {
        if (!window.confirm('Excluir esta tarefa?')) return;
        try {
            await api.delete(`/tasks/${id}/`);
            fetchData();
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="dashboard">
            <header className="dash-header">
                <div className="logo">
                    <CheckCircle color="#6366f1" size={32} />
                    <span>TaskMaster</span>
                </div>
                <div className="user-menu">
                    <span>{user?.username}</span>
                    <button onClick={logout} className="logout-btn"><LogOut size={20} /></button>
                </div>
            </header>

            <main className="dash-content">
                <aside className="sidebar">
                    <section className="side-section">
                        <h3><Folder size={18} /> Categorias</h3>
                        <form onSubmit={handleCreateCategory} className="mini-form">
                            <input
                                type="text"
                                placeholder="Nova categoria..."
                                value={newCategory.name}
                                onChange={e => setNewCategory({ ...newCategory, name: e.target.value })}
                                required
                            />
                            <button type="submit"><Plus size={16} /></button>
                        </form>
                        <ul className="cat-list">
                            <li className={!statusFilter && !filter ? 'active' : ''} onClick={() => { setFilter(''); setStatusFilter('') }}>Todas</li>
                            {categories.map(cat => (
                                <li key={cat.id}>
                                    <span className="cat-dot" style={{ backgroundColor: cat.color }}></span>
                                    {cat.name}
                                </li>
                            ))}
                        </ul>
                    </section>
                </aside>

                <section className="tasks-area">
                    <div className="task-tools">
                        <form onSubmit={handleCreateTask} className="task-form">
                            <input
                                type="text"
                                placeholder="O que precisa ser feito?"
                                value={newTask.title}
                                onChange={e => setNewTask({ ...newTask, title: e.target.value })}
                                required
                            />
                            <select
                                value={newTask.category}
                                onChange={e => setNewTask({ ...newTask, category: e.target.value })}
                            >
                                <option value="">Sem Categoria</option>
                                {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                            </select>
                            <button type="submit"><Plus size={20} /> Adicionar</button>
                        </form>

                        <div className="filters">
                            <div className="search-box">
                                <Filter size={18} />
                                <input
                                    type="text"
                                    placeholder="Filtrar tarefas..."
                                    value={filter}
                                    onChange={e => setFilter(e.target.value)}
                                />
                            </div>
                            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                                <option value="">Todos Status</option>
                                <option value="true">Concluídas</option>
                                <option value="false">Pendentes</option>
                            </select>
                        </div>
                    </div>

                    <div className="task-list">
                        {tasks.map(task => (
                            <div key={task.id} className={`task-item ${task.completed ? 'done' : ''}`}>
                                <button className="toggle-btn" onClick={() => toggleTask(task)}>
                                    {task.completed ? <CheckCircle color="#22c55e" /> : <Circle color="#94a3b8" />}
                                </button>
                                <div className="task-info">
                                    <h4>{task.title}</h4>
                                    {task.category_name && <span className="cat-tag">{task.category_name}</span>}
                                </div>
                                <div className="task-actions">
                                    <button className="share-btn" onClick={() => setSharingTask(task)}><Share2 size={18} /></button>
                                    <button className="del-btn" onClick={() => deleteTask(task.id)}><Trash2 size={18} /></button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {sharingTask && (
                        <div className="modal-overlay">
                            <div className="modal">
                                <h3>Compartilhar: {sharingTask.title}</h3>
                                <input
                                    type="text"
                                    placeholder="Buscar usuário..."
                                    value={userSearch}
                                    onChange={e => setUserSearch(e.target.value)}
                                    autoFocus
                                />
                                <ul className="user-results">
                                    {users.map(u => (
                                        <li key={u.id} onClick={() => handleShare(u.id)}>
                                            {u.username} ({u.email})
                                        </li>
                                    ))}
                                </ul>
                                <button className="close-btn" onClick={() => setSharingTask(null)}>Fechar</button>
                            </div>
                        </div>
                    )}

                    <div className="pagination">
                        <button disabled={page === 1} onClick={() => setPage(p => p - 1)}><ChevronLeft /></button>
                        <span>Página {page} de {totalPages || 1}</span>
                        <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)}><ChevronRight /></button>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default Dashboard;
