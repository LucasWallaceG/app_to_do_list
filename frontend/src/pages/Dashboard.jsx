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
    ChevronRight,
    Pencil,
    User as UserIcon,
    Clock,
    Calendar,
    Palette,
    Info,
    Quote
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
    const [categoryFilter, setCategoryFilter] = useState('');
    const [editingTask, setEditingTask] = useState(null);
    const [editingCategory, setEditingCategory] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        fetchData();
    }, [page, filter, statusFilter, categoryFilter]);

    useEffect(() => {
        if (userSearch) {
            const timeout = setTimeout(searchUsers, 300);
            return () => clearTimeout(timeout);
        } else {
            setUsers([]);
        }
    }, [userSearch]);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [tasksRes, catsRes] = await Promise.all([
                api.get(`/tasks/?page=${page}&search=${filter}&completed=${statusFilter}&category=${categoryFilter}`),
                api.get('/categories/')
            ]);
            setTasks(tasksRes.data.results);
            setTotalPages(Math.ceil(tasksRes.data.count / 10));
            setCategories(catsRes.data.results);
        } catch (err) {
            console.error("Error fetching data", err);
        } finally {
            setIsLoading(false);
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
            // Get current shared users from details to avoid overwriting
            const currentSharedIds = (sharingTask.shared_with_details || []).map(u => u.id);

            if (currentSharedIds.includes(toUserId)) {
                alert('Tarefa já compartilhada com este usuário.');
                return;
            }

            await api.patch(`/tasks/${sharingTask.id}/`, {
                shared_with: [...currentSharedIds, toUserId]
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

    const handleUpdateCategory = async (e) => {
        e.preventDefault();
        try {
            await api.patch(`/categories/${editingCategory.id}/`, {
                name: editingCategory.name,
                color: editingCategory.color
            });
            setEditingCategory(null);
            fetchData();
        } catch (err) {
            alert('Erro ao atualizar categoria.');
        }
    };

    const handleDeleteCategory = async (id, e) => {
        e.stopPropagation(); // Don't trigger filter
        if (!window.confirm('Excluir esta categoria? As tarefas associadas ficarão sem categoria.')) return;
        try {
            await api.delete(`/categories/${id}/`);
            if (categoryFilter == id) setCategoryFilter('');
            fetchData();
        } catch (err) {
            alert('Erro ao excluir categoria.');
        }
    };

    const handleUpdateTask = async (e) => {
        e.preventDefault();
        try {
            // Ensure date is formatted correctly for backend if it's an empty string
            const updatedTask = { ...editingTask };
            if (!updatedTask.due_date) delete updatedTask.due_date;

            await api.patch(`/tasks/${editingTask.id}/`, updatedTask);
            setEditingTask(null);
            fetchData();
        } catch (err) {
            alert('Erro ao atualizar tarefa.');
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

    const isOwner = (task) => String(task.owner) === String(user?.user_id);

    return (
        <div className="dashboard">
            <header className="dash-header">
                <div className="logo">
                    <CheckCircle color="#6366f1" size={32} />
                    <span>TaskMaster</span>
                </div>
                <div className="user-menu">
                    <UserIcon size={18} />
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
                            <div className="color-picker-wrapper" title="Selecione uma cor para a categoria">
                                <Palette size={16} />
                                <input
                                    type="color"
                                    value={newCategory.color}
                                    onChange={e => setNewCategory({ ...newCategory, color: e.target.value })}
                                    className="color-picker"
                                />
                            </div>
                            <button type="submit"><Plus size={16} /></button>
                        </form>
                        <ul className="cat-list">
                            <li className={!statusFilter && !filter && !categoryFilter ? 'active' : ''} onClick={() => { setFilter(''); setStatusFilter(''); setCategoryFilter('') }}>Todas</li>
                            {categories.map(cat => (
                                <li key={cat.id} className={`cat-item ${categoryFilter == cat.id ? 'active' : ''}`} onClick={() => setCategoryFilter(cat.id)}>
                                    <div className="cat-info-sidebar">
                                        <span className="cat-dot" style={{ backgroundColor: cat.color }}></span>
                                        {cat.name}
                                    </div>
                                    <div className="cat-actions">
                                        <button className="cat-edit-btn" onClick={(e) => { e.stopPropagation(); setEditingCategory(cat); }}><Pencil size={14} /></button>
                                        <button className="cat-del-btn" onClick={(e) => handleDeleteCategory(cat.id, e)}><Trash2 size={14} /></button>
                                    </div>
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
                            <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
                                <option value="">Todas Categorias</option>
                                {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
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
                                    <div className="task-meta">
                                        {task.category_name && <span className="cat-tag">{task.category_name}</span>}
                                        {task.due_date && (
                                            <span className="date-tag" title="Prazo">
                                                <Calendar size={12} />
                                                {new Date(task.due_date).toLocaleDateString()}
                                            </span>
                                        )}
                                        {task.description && (
                                            <span className="info-icon-tag" title={task.description}>
                                                <Info size={14} />
                                            </span>
                                        )}
                                        {!isOwner(task) && <span className="owner-tag">De: {task.owner_username}</span>}

                                        {task.shared_with_details?.length > 0 && (
                                            <div className="task-avatars">
                                                {task.shared_with_details.slice(0, 3).map(u => (
                                                    <div key={u.id} className="mini-avatar" title={u.username}>
                                                        <UserIcon size={10} />
                                                    </div>
                                                ))}
                                                {task.shared_with_details.length > 3 && (
                                                    <div className="avatar-more" title={task.shared_with_details.slice(3).map(u => u.username).join(', ')}>
                                                        +{task.shared_with_details.length - 3}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="task-actions">
                                    {isOwner(task) && (
                                        <>
                                            <button className="edit-btn" title="Editar" onClick={() => setEditingTask(task)}><Pencil size={18} /></button>
                                            <button className="share-btn" title="Compartilhar" onClick={() => setSharingTask(task)}><Share2 size={18} /></button>
                                        </>
                                    )}
                                    <button className="del-btn" title="Excluir" onClick={() => deleteTask(task.id)}><Trash2 size={18} /></button>
                                </div>
                            </div>
                        ))}
                        {tasks.length === 0 && !isLoading && <div className="empty-state">Nenhuma tarefa encontrada.</div>}
                        {isLoading && <div className="loading-state">Carregando...</div>}
                    </div>

                    {sharingTask && (
                        <div className="modal-overlay">
                            <div className="modal">
                                <div className="modal-header">
                                    <h3>Compartilhar: {sharingTask.title}</h3>
                                    <button className="icon-close" onClick={() => setSharingTask(null)}><Plus size={20} style={{ transform: 'rotate(45deg)' }} /></button>
                                </div>
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
                            </div>
                        </div>
                    )}

                    {editingTask && (
                        <div className="modal-overlay">
                            <div className="modal expanded-modal">
                                <div className="modal-header">
                                    <h3>Editar Tarefa</h3>
                                    <button className="icon-close" onClick={() => setEditingTask(null)}><Plus size={20} style={{ transform: 'rotate(45deg)' }} /></button>
                                </div>
                                <form onSubmit={handleUpdateTask} className="edit-form">
                                    <div className="input-group">
                                        <label>Título</label>
                                        <input
                                            type="text"
                                            value={editingTask.title}
                                            onChange={e => setEditingTask({ ...editingTask, title: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="input-row">
                                        <div className="input-group">
                                            <label>Categoria</label>
                                            <select
                                                value={editingTask.category || ''}
                                                onChange={e => setEditingTask({ ...editingTask, category: e.target.value })}
                                            >
                                                <option value="">Sem Categoria</option>
                                                {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                                            </select>
                                        </div>
                                        <div className="input-group">
                                            <label>Prazo</label>
                                            <input
                                                type="datetime-local"
                                                value={editingTask.due_date ? editingTask.due_date.substring(0, 16) : ''}
                                                onChange={e => setEditingTask({ ...editingTask, due_date: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div className="input-group">
                                        <label>Descrição</label>
                                        <textarea
                                            value={editingTask.description || ''}
                                            onChange={e => setEditingTask({ ...editingTask, description: e.target.value })}
                                            placeholder="Detalhes da tarefa..."
                                            rows={3}
                                        />
                                    </div>

                                    {editingTask.shared_with_details?.length > 0 && (
                                        <div className="involved-users">
                                            <label>Usuários Envolvidos</label>
                                            <div className="user-avatars">
                                                {editingTask.shared_with_details.map(u => (
                                                    <div key={u.id} className="user-badge" title={u.email}>
                                                        <UserIcon size={14} />
                                                        <span>{u.username}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <button type="submit" className="auth-button">Salvar Alterações</button>
                                </form>
                            </div>
                        </div>
                    )}

                    {editingCategory && (
                        <div className="modal-overlay">
                            <div className="modal">
                                <div className="modal-header">
                                    <h3>Editar Categoria</h3>
                                    <button className="icon-close" onClick={() => setEditingCategory(null)}><Plus size={20} style={{ transform: 'rotate(45deg)' }} /></button>
                                </div>
                                <form onSubmit={handleUpdateCategory} className="edit-form">
                                    <div className="input-group">
                                        <label>Nome</label>
                                        <input
                                            type="text"
                                            value={editingCategory.name}
                                            onChange={e => setEditingCategory({ ...editingCategory, name: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="input-group">
                                        <label>Cor</label>
                                        <div className="color-picker-wrapper">
                                            <Palette size={16} className="palette-icon" />
                                            <input
                                                type="color"
                                                value={editingCategory.color}
                                                onChange={e => setEditingCategory({ ...editingCategory, color: e.target.value })}
                                                className="color-picker"
                                            />
                                        </div>
                                    </div>
                                    <button type="submit" className="auth-button">Salvar Alterações</button>
                                </form>
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
