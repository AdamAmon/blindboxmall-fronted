import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/axios';
import reactLogo from '../../assets/react.svg';
import AddressManageModal from '../../components/AddressManageModal';
import RechargeModal from '../../components/RechargeModal';

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
      const res = await api.post('/api/user/update', {
        id: user.id,
        ...form
      });
      if (res.data && res.data.success) {
        await onSave(res.data.data);
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

  // 优化头像预览
  const getAvatarDisplay = (avatar, nickname) => {
    if (avatarError || !avatar) {
      return (
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-400 to-blue-500 flex items-center justify-center text-white font-bold text-2xl">
          {nickname?.charAt(0) || 'U'}
        </div>
      );
    }
    return (
      <img
        src={avatar}
        alt="头像"
        className="w-20 h-20 rounded-full object-cover border-2 border-purple-200 shadow"
        onError={() => setAvatarError(true)}
        onLoad={() => setAvatarError(false)}
      />
    );
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
      <div className="bg-white/95 rounded-3xl shadow-2xl p-8 w-[380px] relative border border-white/30">
        <button className="absolute right-4 top-4 text-gray-400 hover:text-gray-600" onClick={onClose}>
          <span className="material-icons">close</span>
        </button>
        <h3 className="text-2xl font-bold mb-6 text-center">编辑个人信息</h3>
        {error && <div className="mb-2 p-2 bg-red-100 text-red-700 rounded text-sm text-center">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="flex flex-col items-center mb-2">
            {getAvatarDisplay(form.avatar, form.nickname)}
          </div>
          <div>
            <label className="block text-gray-700 mb-1 font-medium">昵称</label>
            <input name="nickname" value={form.nickname} onChange={handleChange} className="w-full px-3 py-2 border-2 rounded-xl text-center focus:outline-none focus:ring-2 focus:ring-purple-400" required />
          </div>
          <div>
            <label className="block text-gray-700 mb-1 font-medium">邮箱</label>
            <input name="email" value={form.email} onChange={handleChange} className="w-full px-3 py-2 border-2 rounded-xl text-center focus:outline-none focus:ring-2 focus:ring-purple-400" type="email" />
          </div>
          <div>
            <label className="block text-gray-700 mb-1 font-medium">手机号</label>
            <input name="phone" value={form.phone} onChange={handleChange} className="w-full px-3 py-2 border-2 rounded-xl text-center focus:outline-none focus:ring-2 focus:ring-purple-400" type="tel" />
          </div>
          <div>
            <label className="block text-gray-700 mb-1 font-medium">头像URL</label>
            <input name="avatar" value={form.avatar} onChange={handleChange} className="w-full px-3 py-2 border-2 rounded-xl text-center focus:outline-none focus:ring-2 focus:ring-purple-400" type="text" />
            <p className="text-xs text-gray-400 mt-1">留空将使用默认头像</p>
          </div>
          <button type="submit" disabled={loading} className={`w-full py-3 rounded-xl font-semibold text-lg transition-all duration-200 ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 shadow-lg hover:shadow-xl'}`}>{loading ? '保存中...' : '保存'}</button>
        </form>
      </div>
    </div>
  );
}

export default function Profile() {
  const [user, setUser] = useState(null);
  const [showEdit, setShowEdit] = useState(false);
  const [showAddress, setShowAddress] = useState(false);
  const [showRecharge, setShowRecharge] = useState(false);
  const [defaultAddress, setDefaultAddress] = useState(null);
  const [rechargeRecords, setRechargeRecords] = useState([]);
  const [rechargeSuccess, setRechargeSuccess] = useState(false);
  const [showRechargeRecords, setShowRechargeRecords] = useState(false);
  const pollingRef = useRef(null);
  const navigate = useNavigate();

  // 补充 handleLogout
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  // 补充 handleSaveUser
  const handleSaveUser = async (newUser) => {
    try {
      const res = await api.get('/api/user/get', { params: { id: newUser.id } });
      const freshUser = res.data.data;
      setUser(freshUser);
      localStorage.setItem('user', JSON.stringify(freshUser));
    } catch {
      setUser(newUser);
      localStorage.setItem('user', JSON.stringify(newUser));
    }
  };

  const fetchDefaultAddress = useCallback(async (userId) => {
    try {
      const res = await api.get('/api/address/list', { params: { userId } });
      const list = res.data.data || [];
      setDefaultAddress(list.find(addr => addr.is_default) || null);
    } catch {
      setDefaultAddress(null);
    }
  }, []);

  const fetchRechargeRecords = useCallback(async (uid) => {
    try {
      const res = await api.get('/api/pay/records', { params: { userId: uid } });
      setRechargeRecords(res.data.data || []);
    } catch {
      setRechargeRecords([]);
    }
  }, []);

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
    } catch {
      // 忽略 JSON 解析错误
    }
    if (!userId) {
      navigate('/login');
      return;
    }
    api.get('/api/user/get', { params: { id: userId } })
      .then(res => {
        setUser(res.data.data);
        localStorage.setItem('user', JSON.stringify(res.data.data));
        fetchDefaultAddress(userId);
        fetchRechargeRecords(userId); // 只在进入页面时获取一次充值记录
      })
      .catch(() => {
        navigate('/login');
      });
  }, [navigate, fetchDefaultAddress, fetchRechargeRecords]);

  // 查询余额（用户信息）
  const fetchUser = async (uid) => {
    try {
      const res = await api.get('/api/user/get', { params: { id: uid } });
      setUser(res.data.data);
      localStorage.setItem('user', JSON.stringify(res.data.data));
    } catch {
      // 忽略错误
    }
  };

  // 自动轮询余额（充值后持续监控直到余额更新）
  useEffect(() => {
    if (!showRecharge && user) {
      if (pollingRef.current) clearInterval(pollingRef.current);
      
      // 充值成功后开始轮询
      if (rechargeSuccess) {
        let checkCount = 0;
        const maxChecks = 30; // 最多检查30次（60秒）
        
        pollingRef.current = setInterval(async () => {
          checkCount++;
          // console.log(`[调试] 第${checkCount}次检查余额更新`);
          
          // 获取最新用户信息
          const res = await api.get('/api/user/get', { params: { id: user.id } });
          const latestUser = res.data.data;
          
          // 如果余额有变化，说明支付成功
          if (Number(latestUser.balance) > Number(user.balance)) {
            // console.log('[调试] 检测到余额更新:', user.balance, '->', latestUser.balance);
            setUser(latestUser);
            localStorage.setItem('user', JSON.stringify(latestUser));
            
            // 获取最新充值记录
            fetchRechargeRecords(user.id);
            setShowRechargeRecords(true);
            
            // 停止轮询
            if (pollingRef.current) {
              clearInterval(pollingRef.current);
              setRechargeSuccess(false);
            }
            
            // 显示支付成功提示
            alert('支付成功！余额已更新');
          }
          // 如果检查次数超过限制，停止轮询
          else if (checkCount >= maxChecks) {
            // console.log('[调试] 轮询超时，停止检查');
            if (pollingRef.current) {
              clearInterval(pollingRef.current);
              setRechargeSuccess(false);
            }
          }
        }, 2000); // 每2秒检查一次
        
        return () => {
          if (pollingRef.current) clearInterval(pollingRef.current);
        };
      }
    } else if (pollingRef.current) {
      clearInterval(pollingRef.current);
    }
  }, [showRecharge, user, rechargeSuccess, fetchRechargeRecords]);



  // 充值处理
  const handleRecharge = async (amount) => {
    if (!user) return;
    const res = await api.post('/api/pay/recharge', { userId: user.id, amount });
    if (res.data.success && res.data.payUrl) {
      // 判断payUrl是form还是URL
      if (res.data.payUrl.trim().startsWith('<form')) {
        const payWindow = window.open('', '_blank');
        payWindow.document.write(res.data.payUrl);
        payWindow.document.close();
      } else {
        window.open(res.data.payUrl, '_blank');
      }
      // 支付成功后立即开始监控余额变化
        setRechargeSuccess(true);
      // console.log('[调试] 开始监控余额变化，当前余额:', user.balance);
    } else {
      throw new Error(res.data.message || '充值失败');
    }
  };

  // Profile 组件中保留自己的 getAvatarDisplay 和 setAvatarError
  if (!user) return null;
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex flex-col">
      {/* 顶部品牌+个人信息区 - 减少空白 */}
      <div className="flex flex-col items-center justify-center pt-6 pb-6">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary to-secondary rounded-full shadow-xl mb-3 border-4 border-white">
          <img src={user.avatar || reactLogo} alt="头像" className="w-12 h-12 rounded-full object-cover" />
        </div>
      </div>
      <div className="flex-1 flex flex-col md:flex-row items-start justify-center px-4 py-6 max-w-5xl mx-auto w-full">
        <div className="w-full md:w-96 flex-shrink-0 flex flex-col items-center md:items-start md:mr-12">
          {/* 余额和充值 */}
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/30 p-8 w-full flex flex-col items-center mb-8">
            <div className="text-lg font-semibold text-green-700 flex items-center mb-2">
              <span className="material-icons mr-1">account_balance_wallet</span>
              余额：￥{user.balance?.toFixed(2) ?? '0.00'}
            </div>
            <button
              className="mt-2 px-4 py-2 bg-gradient-to-r from-green-400 to-green-600 text-white rounded shadow hover:from-green-500 hover:to-green-700 transition font-bold"
              onClick={() => setShowRecharge(true)}
            >
              <span className="material-icons mr-1 align-middle">add_circle</span>余额充值
            </button>
          </div>
          {/* 快捷操作 - 删除重复的地址管理按钮 */}
          <div className="w-full grid grid-cols-2 gap-4 mb-4">
            <button className="flex flex-col items-center p-4 bg-gradient-to-br from-purple-100 to-blue-100 rounded-xl shadow hover:scale-105 hover:shadow-lg transition" onClick={() => navigate('/order/list')}>
              <span className="material-icons text-purple-500 text-3xl mb-1">list_alt</span>
              <span className="text-sm font-semibold text-gray-700">我的订单</span>
            </button>
            <button className="flex flex-col items-center p-4 bg-gradient-to-br from-yellow-100 to-orange-100 rounded-xl shadow hover:scale-105 hover:shadow-lg transition" onClick={() => navigate('/prizes')}>
              <span className="material-icons text-yellow-500 text-3xl mb-1">emoji_events</span>
              <span className="text-sm font-semibold text-gray-700">我的奖品</span>
            </button>
          </div>
          <div className="w-full grid grid-cols-2 gap-4 mb-4">
            <button className="flex flex-col items-center p-4 bg-gradient-to-br from-pink-100 to-purple-100 rounded-xl shadow hover:scale-105 hover:shadow-lg transition" onClick={() => navigate('/shows/create')}>
              <span className="material-icons text-pink-500 text-3xl mb-1">star</span>
              <span className="text-sm font-semibold text-gray-700">秀奖品</span>
            </button>
            <button className="flex flex-col items-center p-4 bg-gradient-to-br from-red-100 to-pink-100 rounded-xl shadow hover:scale-105 hover:shadow-lg transition" onClick={handleLogout}>
              <span className="material-icons text-red-500 text-3xl mb-1">logout</span>
              <span className="text-sm font-semibold text-gray-700">退出登录</span>
            </button>
          </div>
        </div>
        {/* 详细信息卡片 - 将编辑按钮移入卡片，删除重复信息 */}
        <div className="flex-1 flex flex-col items-center mt-8 md:mt-0">
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/30 p-8 w-full max-w-2xl">
            <div className="flex justify-between items-center mb-4">
              <div className="font-bold text-xl flex items-center">
                <span className="material-icons text-blue-500 mr-1">person</span>个人信息
              </div>
              <button className="text-blue-600 hover:underline text-sm flex items-center" onClick={() => setShowEdit(true)}>
                <span className="material-icons text-base mr-1">edit</span> 编辑信息
              </button>
            </div>
            <table className="w-full text-left text-gray-700 divide-y divide-gray-100">
              <tbody>
                <tr>
                  <td className="py-2 font-medium w-24">用户名</td>
                  <td>{user.username || <span className="text-gray-400">未填写</span>}</td>
                </tr>
                <tr>
                  <td className="py-2 font-medium">邮箱</td>
                  <td>{user.email || <span className="text-gray-400">未填写</span>}</td>
                </tr>
                <tr>
                  <td className="py-2 font-medium">手机号</td>
                  <td>{user.phone || <span className="text-gray-400">未填写</span>}</td>
                </tr>
                <tr>
                  <td className="py-2 font-medium">角色</td>
                  <td>{user.role === 'customer' ? '顾客' : user.role === 'seller' ? '商家' : '管理员'}</td>
                </tr>
                <tr>
                  <td className="py-2 font-medium">默认收货地址</td>
                  <td>
                    {defaultAddress ? (
                      <span>{defaultAddress.recipient}，{defaultAddress.phone}，{defaultAddress.province}{defaultAddress.city}{defaultAddress.district}{defaultAddress.detail}</span>
                    ) : <span className="text-gray-400">未设置</span>}
                    <button className="ml-2 text-blue-600 hover:underline text-xs" onClick={() => setShowAddress(true)}>管理</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          {/* 充值记录展示 */}
          <div className="w-full bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/30 p-6 mt-8">
            <div className="flex justify-between items-center mb-2">
              <div className="font-bold text-lg flex items-center">
                <span className="material-icons text-green-500 mr-1">history</span>充值记录
              </div>
              <div className="flex space-x-2">
                <button 
                  onClick={() => {
                    fetchRechargeRecords(user.id);
                    fetchUser(user.id);
                  }}
                  className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
                >
                  <span className="material-icons text-base mr-1">refresh</span>
                  刷新
                </button>
                <button 
                  onClick={() => setShowRechargeRecords(!showRechargeRecords)}
                  className="text-green-600 hover:text-green-800 text-sm flex items-center"
                >
                  <span className="material-icons text-base mr-1">
                    {showRechargeRecords ? 'visibility_off' : 'visibility'}
                  </span>
                  {showRechargeRecords ? '隐藏' : '查看'}
                </button>
              </div>
            </div>
            {showRechargeRecords ? (
              <table className="w-full text-sm divide-y divide-gray-100">
                <thead>
                  <tr className="text-gray-500">
                    <th className="py-1">时间</th>
                    <th className="py-1">金额</th>
                    <th className="py-1">状态</th>
                  </tr>
                </thead>
                <tbody>
                  {rechargeRecords.length === 0 && <tr><td colSpan={3} className="text-center text-gray-400 py-2">暂无记录</td></tr>}
                  {rechargeRecords.map(r => (
                    <tr key={r.recharge_id} className="hover:bg-green-50 transition">
                      <td className="py-1">{new Date(r.created_at).toLocaleString()}</td>
                      <td className="py-1 text-green-700 font-semibold">￥{Number(r.recharge_amount).toFixed(2)}</td>
                      <td className="py-1">{r.recharge_status === 'success' ? <span className="text-green-600">成功</span> : r.recharge_status === 'pending' ? <span className="text-yellow-600">待支付</span> : <span className="text-red-600">失败</span>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center text-gray-400 py-4">
                点击"查看"按钮查看充值历史
              </div>
            )}
          </div>
        </div>
      </div>
      {/* 弹窗区 */}
      <EditUserModal user={user} open={showEdit} onClose={() => setShowEdit(false)} onSave={handleSaveUser} />
      <AddressManageModal userId={user.id} open={showAddress} onClose={() => { setShowAddress(false); fetchDefaultAddress(user.id); }} onSelectDefault={() => fetchDefaultAddress(user.id)} />
      <RechargeModal open={showRecharge} onClose={() => setShowRecharge(false)} onRecharge={handleRecharge} />
      {rechargeSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
          <div className="bg-white rounded-xl shadow-xl p-8 w-[320px] text-center">
            <div className="text-2xl text-green-600 font-bold mb-2">充值请求已发起</div>
            <div className="text-gray-700 mb-4">
              请在支付宝沙箱完成支付，系统会自动监控余额变化。<br />
              <span className="text-sm text-gray-500">支付成功后会自动刷新余额和充值记录</span>
            </div>
            <div className="flex justify-center space-x-2">
              <button className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600" onClick={() => setRechargeSuccess(false)}>我知道了</button>
              <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600" onClick={() => { fetchUser(user.id); fetchRechargeRecords(user.id); }}>手动刷新</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}