import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function ResourceTable({ resourcePath, columns, formFields, canEdit }) {
  const [data, setData] = useState([]);
  const [formVisible, setFormVisible] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const res = await axios.get(resourcePath); // GET
    setData(res.data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${resourcePath}&action=create`, formData, { 
        headers: { 'Content-Type': 'application/json' } 
      }); // POST
      fetchData();
      setFormVisible(false);
    } catch (err) {
      alert(err.response?.data?.error || 'Lỗi server');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa?')) return;
    try {
      await axios.delete(`${resourcePath}&action=delete&id=${id}`);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || 'Lỗi server');
    }
  };

  return (
    <div>
      {canEdit && <button onClick={() => setFormVisible(true)} className="mb-2 p-2 bg-blue-500 text-white rounded">Thêm mới</button>}

      {formVisible && canEdit && (
        <form onSubmit={handleSubmit} className="mb-4 p-4 border rounded">
          {formFields.map(field => (
            <div key={field.key} className="mb-2">
              <label>{field.label}</label>
              <input
                type="text"
                value={formData[field.key] || ''}
                onChange={e => setFormData({ ...formData, [field.key]: e.target.value })}
                className="border p-1 w-full"
                required
              />
            </div>
          ))}
          <button type="submit" className="p-2 bg-green-500 text-white rounded">Lưu</button>
        </form>
      )}

      <table className="w-full border">
        <thead>
          <tr>
            {columns.map(col => <th key={col.key} className="border px-2 py-1">{col.label}</th>)}
            {canEdit && <th className="border px-2 py-1">Hành động</th>}
          </tr>
        </thead>
        <tbody>
          {data.map(row => (
            <tr key={row.id}>
              {columns.map(col => <td key={col.key} className="border px-2 py-1">{row[col.key]}</td>)}
              {canEdit && (
                <td className="border px-2 py-1">
                  <button onClick={() => handleDelete(row.id)} className="mr-2 p-1 bg-red-500 text-white rounded">Xóa</button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
