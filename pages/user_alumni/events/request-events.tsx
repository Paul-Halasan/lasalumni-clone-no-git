import React from 'react';
import withAuth from '../../../components/withAuth';
import RequestEvent from '../../../components/alumni/events/request-event/RequestEvent';

export function SubmitEventPage() {
    return (
        <div>
            <RequestEvent />
        </div>
    );
}

export default withAuth(SubmitEventPage, ['alumni']);