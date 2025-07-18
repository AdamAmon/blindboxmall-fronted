import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import reactLogo from '../../assets/react.svg';
import AddressManageModal from '../../components/AddressManageModal';

const DEFAULT_AVATAR = reactLogo;

function QuickActions({ onAddressManage, onLogout }) {
  return (
    <div className="space-y-4 mt-8 w-full">
      <button className="w-full flex items-center justify-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition" onClick={onAddressManage}>
        <span className="material-icons mr-2">location_on</span> 管理地址
      </button>
      <button className="w-full flex items-center justify-center p-4 bg-red-50 rounded-lg hover:bg-red-100 transition" onClick={onLogout}>
        <span className="material-icons mr-2">logout</span> 退出登录
      </button>
    </div>
  );
}

function UserInfoCard({ user, defaultAddress, onEdit, onAddressManage }) {
  // 新增一个通用的显示函数
  const displayOrPlaceholder = (val) => (val && val.trim() ? val : <span className="text-gray-400">未填写</span>);
  return (
    <div className="bg-white rounded-xl shadow p-8 w-full max-w-2xl">
      <div className="flex justify-between items-center mb-4">
        <div className="font-bold text-xl">个人信息</div>
        <button className="text-blue-600 hover:underline text-sm flex items-center" onClick={onEdit}>
          <span className="material-icons text-base mr-1">edit</span> 编辑信息
        </button>
      </div>
      <table className="w-full text-left text-gray-700">
        <tbody>
          <tr>
            <td className="py-2 font-medium w-24">昵称</td>
            <td>{displayOrPlaceholder(user.nickname)}</td>
          </tr>
          <tr>
            <td className="py-2 font-medium">用户名</td>
            <td>{displayOrPlaceholder(user.username)}</td>
          </tr>
          <tr>
            <td className="py-2 font-medium">邮箱</td>
            <td>{displayOrPlaceholder(user.email)}</td>
          </tr>
          <tr>
            <td className="py-2 font-medium">手机号</td>
            <td>{displayOrPlaceholder(user.phone)}</td>
          </tr>
          <tr>
            <td className="py-2 font-medium">角色</td>
            <td>{user.role === 'customer' ? '顾客' : user.role === 'seller' ? '商家' : '管理员'}</td>
          </tr>
          <tr>
            <td className="py-2 font-medium">默认收货地址</td>
            <td>{defaultAddress ? (
              <span>{defaultAddress.recipient}，{defaultAddress.phone}，{defaultAddress.province}{defaultAddress.city}{defaultAddress.district}{defaultAddress.detail}</span>
            ) : <span className="text-gray-400">未设置</span>}
              <button className="ml-2 text-blue-600 hover:underline text-xs" onClick={onAddressManage}>管理</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

function EditUserModal({ user, open, onClose, onSave }) {
  const [form, setForm] = useState({ nickname: '', email: '', phone: '', avatar: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [avatarError, setAvatarError] = useState(false);

  useEffect(() => {
    if (open && user) {
      setForm({
        nickname: user.nickname || '',
        email: user.email || '',
        phone: user.phone || '',
        avatar: user.avatar || ''
      });
      setError('');
      setAvatarError(false);
    }
  }, [open, user]);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
    if (name === 'avatar') setAvatarError(false);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await axios.post('/api/user/update', {
        id: user.id,
        ...form
      });
      if (res.data && res.data.success) {
        await onSave(res.data.data); // 这里加 await，确保 async 逻辑被执行
        onClose();
      } else {
        setError(res.data.message || '保存失败');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || '保存失败');
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
      <div className="bg-white rounded-xl shadow-xl p-8 w-[360px] relative">
        <button className="absolute right-4 top-4 text-gray-400 hover:text-gray-600" onClick={onClose}>
          <span className="material-icons">close</span>
        </button>
        <h3 className="text-xl font-bold mb-4 text-center">编辑个人信息</h3>
        {error && <div className="mb-2 p-2 bg-red-100 text-red-700 rounded text-sm text-center">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 mb-1">昵称</label>
            <input name="nickname" value={form.nickname} onChange={handleChange} className="w-full px-3 py-2 border rounded-md text-center" required />
          </div>
          <div>
            <label className="block text-gray-700 mb-1">邮箱</label>
            <input name="email" value={form.email} onChange={handleChange} className="w-full px-3 py-2 border rounded-md text-center" type="email" />
          </div>
          <div>
            <label className="block text-gray-700 mb-1">手机号</label>
            <input name="phone" value={form.phone} onChange={handleChange} className="w-full px-3 py-2 border rounded-md text-center" type="tel" />
          </div>
          <div>
            <label className="block text-gray-700 mb-1">头像URL</label>
            <input name="avatar" value={form.avatar} onChange={handleChange} className="w-full px-3 py-2 border rounded-md text-center" type="text" />
            <div className="flex flex-col items-center mt-2">
              <img
                src={avatarError || !form.avatar ? DEFAULT_AVATAR : form.avatar}
                alt="头像预览"
                className="w-16 h-16 rounded-full border object-cover bg-gray-100"
                onError={() => setAvatarError(true)}
                onLoad={() => setAvatarError(false)}
              />
              <span className="text-xs text-gray-400 mt-1">头像预览</span>
            </div>
          </div>
          <button type="submit" disabled={loading} className={`w-full py-2 rounded-md font-semibold text-lg ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 text-white hover:bg-green-700'}`}>{loading ? '保存中...' : '保存'}</button>
        </form>
      </div>
    </div>
  );
}

export default function Profile() {
  const [user, setUser] = useState(null);
  const [showEdit, setShowEdit] = useState(false);
  const [showAddress, setShowAddress] = useState(false);
  const [defaultAddress, setDefaultAddress] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // 只从 localStorage 拿 token，用户信息始终从后端拉取
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    // 假设 token 解码或 localStorage 里有 userId
    let userId = null;
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const u = JSON.parse(userStr);
        userId = u.id;
      }
    } catch {}
    // 如果 localStorage 没有 userId，可以考虑让登录后把 userId 单独存一份
    if (!userId) {
      navigate('/login');
      return;
    }
    // 只从后端拉取用户信息
    axios.get('/api/user/get', { params: { id: userId } })
      .then(res => {
        setUser(res.data.data);
        // 可选：同步最新 user 到 localStorage
        localStorage.setItem('user', JSON.stringify(res.data.data));
        fetchDefaultAddress(userId);
      })
      .catch(() => {
        navigate('/login');
      });
  }, [navigate]);

  const fetchDefaultAddress = async (userId) => {
    try {
      const res = await axios.get('/api/address/list', { params: { userId } });
      const list = res.data.data || [];
      setDefaultAddress(list.find(addr => addr.is_default) || null);
    } catch {
      setDefaultAddress(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleSaveUser = async (newUser) => {
    // 保存后也只从后端拉取
    try {
      const res = await axios.get('/api/user/get', { params: { id: newUser.id } });
      const freshUser = res.data.data;
      setUser(freshUser);
      localStorage.setItem('user', JSON.stringify(freshUser));
    } catch (e) {
      setUser(newUser);
      localStorage.setItem('user', JSON.stringify(newUser));
    }
  };

  return user && (
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-400 via-purple-300 to-blue-200 flex flex-col">
      <div className="flex-1 flex flex-col md:flex-row items-start justify-center px-4 py-10 relative">
        {/* 左侧欢迎区+操作区 */}
        <div className="w-full md:w-80 flex-shrink-0 flex flex-col items-center md:items-start md:mr-12">
          <div className="flex flex-col items-center mt-6 mb-4 w-full">
            <img
              src={user.avatar || DEFAULT_AVATAR}
              alt="头像"
              className="w-20 h-20 rounded-full border object-cover bg-gray-100 mb-2"
              onError={e => { e.target.onerror = null; e.target.src = DEFAULT_AVATAR; }}
            />
            <div className="text-2xl font-bold mt-2">{user.nickname}</div>
            <div className="text-gray-500 text-sm">{user.username}</div>
            <div className="text-gray-500 text-sm mt-1">欢迎使用盲盒商城</div>
          </div>
          <QuickActions onAddressManage={() => setShowAddress(true)} onLogout={handleLogout} />
        </div>
        {/* 右侧信息卡片 */}
        <div className="flex-1 flex flex-col items-center mt-8 md:mt-0">
          <UserInfoCard user={user} defaultAddress={defaultAddress} onEdit={() => setShowEdit(true)} onAddressManage={() => setShowAddress(true)} />
        </div>
        <EditUserModal user={user} open={showEdit} onClose={() => setShowEdit(false)} onSave={handleSaveUser} />
        <AddressManageModal userId={user.id} open={showAddress} onClose={() => { setShowAddress(false); fetchDefaultAddress(user.id); }} onSelectDefault={() => fetchDefaultAddress(user.id)} />
      </div>
    </div>
  );
} 