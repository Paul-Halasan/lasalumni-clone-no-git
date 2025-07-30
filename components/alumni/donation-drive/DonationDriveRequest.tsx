import React, { useState } from 'react';
import axios from 'axios';
import { TextInput, Textarea, Button, Container, Notification, FileInput } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconCheck, IconX } from '@tabler/icons-react';

const DonationDriveRequest: React.FC = () => {
  const [dd_title, setDdTitle] = useState('');
  const [dd_image, setDdImage] = useState<File | null>(null);
  const [dd_desc, setDdDesc] = useState('');
  const [notification, setNotification] = useState<{ message: string; color: 'green' | 'red' } | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!dd_image) {
      notifications.show({
        title: 'Image Required',
        message: 'Please upload an image before submitting.',
        color: 'red',
        icon: <IconX />,
        autoClose: false,
      });
      return;
    }

    const dd_imageFileName = `${Date.now()}-${dd_image.name}`;

    try {
      // Get presigned URL
      const { data: { url } } = await axios.get(`/api/generate_presigned_url?fileName=${dd_imageFileName}&fileType=${dd_image.type}`);

      // Upload the image directly to S3 using the presigned URL
      await axios.put(url, dd_image, {
        headers: {
          'Content-Type': dd_image.type,
        },
      });

      // Continue with form data submission
      const formData = {
        dd_title,
        dd_imageFileName, // Send the filename instead of the file
        dd_desc,
      };

      // Attempt to refresh the access token first
      const refreshResponse = await axios.post('/api/refresh', { withCredentials: true });

      // If refresh is successful, proceed with submitting the donation drive request
      if (refreshResponse.status === 200) {
        console.log('Access token refreshed successfully');

        // Now submit the donation drive request after refreshing the access token
        const response = await fetch('/api/submit_donation_drive', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
          credentials: 'include', // Ensure cookies (access-token) are included
        });

        // If the donation drive request submission is successful
        if (response.ok) {
          const responseData = await response.json();
          notifications.show({
            title: 'Success',
            message: `Donation drive request: "${dd_title}" submitted successfully!`,
            color: 'green',
            icon: <IconCheck />,
          });

          // Notify the user
          await axios.post('/api/insert_notif', {
            message: `Donation drive request: "${dd_title}" has been submitted. It is now being reviewed.`,
            directTo: "donation-drives",
            userID: responseData.donationDrive.submitted_by,
            isAdmin: false,
          });
        } else {
          // If the donation drive request submission fails
          notifications.show({
            title: 'Error',
            message: `Error submitting donation drive request: "${dd_title}"`,
            color: 'red',
            icon: <IconX />,
          });
        }
      } else {
        notifications.show({
          title: 'Error',
          message: 'Failed to refresh access token. Please try again.',
          color: 'red',
          icon: <IconX />,
        });
      }
    } catch (error) {
      console.error('Error during submission or token refresh:', error);
      notifications.show({
        title: 'Error',
        message: 'Error submitting form! Please try again.',
        color: 'red',
        icon: <IconX />,
        autoClose: false,
      });
    }
  };

  return (
    <Container size="sm">
      {notification && (
        <Notification color={notification.color} onClose={() => setNotification(null)} mt="md">
          {notification.message}
        </Notification>
      )}
      <form onSubmit={handleSubmit}>
        <TextInput
          label="Title"
          value={dd_title}
          onChange={(e) => setDdTitle(e.target.value)}
          required
          mb="md"
        />
        <FileInput
          label="Upload Image"
          placeholder="Choose image"
          onChange={(file) => setDdImage(file)}
          required
          accept="image/*"
          mb="md"
        />
        <Textarea
          label="Description"
          value={dd_desc}
          onChange={(e) => setDdDesc(e.target.value)}
          required
          mb="md"
        />
        <Button type="submit">Submit</Button>
      </form>
    </Container>
  );
};

export default DonationDriveRequest;