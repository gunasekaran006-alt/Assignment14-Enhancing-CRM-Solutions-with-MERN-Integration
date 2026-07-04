import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Dashboard = () => {
  const [customers, setCustomers] = useState([]);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', company: '' });
  
  // Update-State
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);

  axios.defaults.withCredentials = true;

  // READ
  const fetchCustomers = async () => {
    try {
      const res = await axios.get('http://localhost:8080/api/customers');
      setCustomers(res.data.customers);
    } catch (error) {
      console.error("Error fetching data");
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  // CREATE & UPDATE
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        // Edit PUT request
        await axios.put(`http://localhost:8080/api/customers/${editId}`, formData);
        setIsEditing(false);
        setEditId(null);
      } else {
        // New Add POST request
        await axios.post('http://localhost:8080/api/customers', formData);
      }
      
      setFormData({ name: '', email: '', phone: '', company: '' }); 
      fetchCustomers(); 
    } catch (error) {
      alert("Action failed. Please try again.");
    }
  };

  // EDIT Button Click
  const handleEdit = (customer) => {
    setFormData({ 
      name: customer.name, 
      email: customer.email, 
      phone: customer.phone, 
      company: customer.company 
    });
    setIsEditing(true);
    setEditId(customer._id);
  };

  // DELETE
  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:8080/api/customers/${id}`);
      fetchCustomers();
    } catch (error) {
      alert("Failed to delete");
    }
  };

  return (
    <div style={{ padding: '30px', fontFamily: 'Arial' }}>
      <h2>CRM Dashboard</h2>
      <hr/>
      
      <div style={{ marginBottom: '30px', marginTop: '20px' }}>
        <h3>{isEditing ? "Edit Customer" : "Add New Customer"}</h3>
        <form onSubmit={handleSubmit}>
          <input type="text" placeholder="Name" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} style={{ padding: '8px', marginRight: '10px' }} />
          <input type="email" placeholder="Email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} style={{ padding: '8px', marginRight: '10px' }} />
          <input type="text" placeholder="Phone" required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} style={{ padding: '8px', marginRight: '10px' }} />
          <input type="text" placeholder="Company" value={formData.company} onChange={e => setFormData({...formData, company: e.target.value})} style={{ padding: '8px', marginRight: '10px' }} />
          
          <button type="submit" style={{ padding: '9px 15px', backgroundColor: isEditing ? 'blue' : 'green', color: 'white', border: 'none', cursor: 'pointer' }}>
            {isEditing ? "Update Customer" : "Add Customer"}
          </button>
        </form>
      </div>

      <h3>Customer List</h3>
      <table border="1" cellPadding="12" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
        <thead style={{ backgroundColor: '#f2f2f2' }}>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Company</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {customers.length === 0 ? <tr><td colSpan="5">No customers found. Add one above!</td></tr> : 
            customers.map(cust => (
              <tr key={cust._id}>
                <td>{cust.name}</td>
                <td>{cust.email}</td>
                <td>{cust.phone}</td>
                <td>{cust.company}</td>
                <td>
                  <button onClick={() => handleEdit(cust)} style={{ backgroundColor: 'orange', color: 'white', padding: '5px 10px', border: 'none', cursor: 'pointer', marginRight: '10px' }}>Edit</button>
                  <button onClick={() => handleDelete(cust._id)} style={{ backgroundColor: 'red', color: 'white', padding: '5px 10px', border: 'none', cursor: 'pointer' }}>Delete</button>
                </td>
              </tr>
            ))
          }
        </tbody>
      </table>
    </div>
  );
};

export default Dashboard;