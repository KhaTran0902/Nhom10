import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import { Button, message as antdMessage } from "antd";
import axios from 'axios';

const VerifyEmail = () => {
    const [message, setMessage] = useState('');
    const history = useHistory();

    const verifyEmail = async () => {
        try {
            const token = window.location.search.substring(7); 
            const response = await axios.get(`http://localhost:3100/api/auth/verify?token=${token}`);
            setMessage(response.data.message);
            antdMessage.success(response.data.message); 
            history.push('/');
        } catch (error) {
            setMessage('Failed to verify email');
            antdMessage.error('Failed to verify email'); 
            console.error(error);
        }
    };

    return (
        <div style={{ textAlign: 'center', marginTop: '50px' }}>
            <h1>Email Verification</h1>
            <Button type="primary" onClick={verifyEmail}>Verify Email</Button>
            <p style={{ marginTop: '20px' }}>{message}</p>
        </div>
    );
}

export default VerifyEmail;
