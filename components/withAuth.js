import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { useUser } from '../hooks/useUser';
import axios from 'axios';

const withAuth = (WrappedComponent, allowedRoles) => {
    return (props) => {
        const { user, loading } = useUser();
        const router = useRouter();

        useEffect(() => {
            const refreshAccessToken = async () => {
                try {
                    const response = await axios.post('/api/refresh');
                    if (response.status === 200) {
                        // Token refreshed successfully, fetch the user again
                        window.location.reload(); // Reload the page to re-fetch user
                    }
                } catch (error) {
                    console.error('Error refreshing access token:', error);
                    router.push("/?page=login");
                }
            };

            if (!loading) {
                console.log('User (debug only):', user);
                if (!user || !allowedRoles.includes(user.userType) ) {
                    if (!user) {
                        refreshAccessToken();
                    } else {
                        alert("You do not have the privilege to access this page. You will be logged out.");
                        axios.get('/api/logout'); // Log out user
                        router.push("/?page=login"); // Redirect to login if user is not allowed
                    }
                }
            }
            
        }, [loading, user]);

        if (loading || !user || !allowedRoles.includes(user.userType)) {
            return <p>Loading...</p>;
        }

        return <WrappedComponent {...props} />;
    };
};

export default withAuth;