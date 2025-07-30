import React, { useState, useEffect } from "react";
import withAuth from "../../../components/withAuth";
import ApproveEvents from "../../../components/admin/ApproveEvents/ApproveEvents"; // Adjust the path as necessary
import axios from "axios";

const EventApprove = () => {
  const [events, setEvents] = useState<any[]>([]); // Adjust the type as necessary

  const updateUnapprovedEventsCount = () => {
    // Logic to update unapproved events count
  };

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await axios.get("/api/get_events");
        setEvents(response.data.events);
      } catch (error) {
        console.error("Error fetching events:", error);
      }
    };

    fetchEvents();
  }, []);

  return (
    <>
      <ApproveEvents
        updateUnapprovedEventsCount={updateUnapprovedEventsCount}
        events={events}
      />
    </>
  );
};

export default withAuth(EventApprove, ["admin"]);
