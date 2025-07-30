import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';

export const useUser = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await axios.get(`/api/user`);
                setUser(response.data);
            } catch (error) {
                console.error('Error fetching user:', error);
                // If error is due to unauthorized (e.g., token expired), try refreshing the token
                if (error.response && error.response.status === 401) {
                    try {
                        const refreshResponse = await axios.post('/api/refresh');
                        if (refreshResponse.status === 200) {
                            // Retry fetching the user after refreshing the token
                            fetchUser();
                        }
                    } catch (refreshError) {
                        console.error('Error refreshing token:', refreshError);
                        router.push("/?page=login"); // Redirect to login if refresh fails
                    }
                }
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, []);

    return { user, loading };
};
