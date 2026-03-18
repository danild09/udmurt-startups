import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const AuthSuccess = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { setUser } = useAuth();

    useEffect(() => {
        const processLogin = async () => {
            const params = new URLSearchParams(location.search);
            const token = params.get('token');

            if (token) {
                localStorage.setItem('token', token);
                
                // Fetch user data via /me to populate context
                try {
                    const res = await axios.get('http://localhost:5000/api/auth/me', {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    
                    // Direct access to AuthContext requires some workaround since setUser isn't exposed by default
                    // Let's force a reload which will read the token and fetch /me automatically
                    window.location.href = '/dashboard';
                } catch (err) {
                    console.error('Failed to get user details:', err);
                    navigate('/login?error=AuthFailed');
                }
            } else {
                navigate('/login?error=InvalidToken');
            }
        };

        processLogin();
    }, [location, navigate, setUser]);

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column' }}>
            <h2>Авторизация...</h2>
            <p>Пожалуйста, подождите, мы перенаправляем вас в личный кабинет.</p>
        </div>
    );
};

export default AuthSuccess;
