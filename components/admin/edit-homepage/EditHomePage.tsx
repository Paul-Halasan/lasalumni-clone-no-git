import React, { useState, useEffect } from 'react';
import { Container, TextInput, Button, FileInput, Group } from '@mantine/core';
import axios from 'axios';
import { notifications } from '@mantine/notifications';

const EditHomePage = () => {
  const [description, setDescription] = useState('');
  const [homepageBackgroundImage, setHomepageBackgroundImage] = useState<File | null>(null);
  const [loginBackgroundImage, setLoginBackgroundImage] = useState<File | null>(null);

  useEffect(() => {
    // Fetch the current values
    const fetchData = async () => {
      try {
        const response = await axios.get('/api/get_homepage_content');
        setDescription(response.data.description);
        setHomepageBackgroundImage(response.data.homepageBackgroundImage);
        setLoginBackgroundImage(response.data.loginBackgroundImage);
      } catch (error) {
        console.error('Error fetching homepage content:', error);
      }
    };

    fetchData();
  }, []);

  const handleSave = async () => {
    const formData = new FormData();
    formData.append('description', description);
    if (homepageBackgroundImage) {
      formData.append('homepageBackgroundImage', homepageBackgroundImage);
    }
    if (loginBackgroundImage) {
      formData.append('loginBackgroundImage', loginBackgroundImage);
    }

    try {
      await axios.post('/api/update_homepage_content', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      notifications.show({
        title: 'Success',
        message: 'Homepage content updated successfully',
        color: 'green',
      });
    } catch (error) {
      console.error('Error updating homepage content:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to update homepage content',
        color: 'red',
      });
    }
  };

  const handleResetToDefault = async (type: string) => {
    try {
      await axios.post('/api/reset_to_default', { type });
      notifications.show({
        title: 'Success',
        message: `${type} reset to default successfully`,
        color: 'green',
      });
      // Fetch the updated values
      const response = await axios.get('/api/get_homepage_content');
      setDescription(response.data.description);
      setHomepageBackgroundImage(response.data.homepageBackgroundImage);
      setLoginBackgroundImage(response.data.loginBackgroundImage);
    } catch (error) {
      console.error(`Error resetting ${type} to default:`, error);
      notifications.show({
        title: 'Error',
        message: `Failed to reset ${type} to default`,
        color: 'red',
      });
    }
  };

  return (
    <Container>
      <TextInput
        label="Description"
        value={description}
        onChange={(event) => setDescription(event.currentTarget.value)}
        required
      />
      <FileInput
        label="Homepage Background Image"
        placeholder="Choose image"
        onChange={setHomepageBackgroundImage}
        accept="image/*"
      />
      <FileInput
        label="Login Background Image"
        placeholder="Choose image"
        onChange={setLoginBackgroundImage}
        accept="image/*"
      />
      <Group align="right" mt="md">
        <Button onClick={handleSave}>Save</Button>
        <Button color="red" onClick={() => handleResetToDefault('homepage')}>Reset Homepage to Default</Button>
        <Button color="red" onClick={() => handleResetToDefault('login')}>Reset Login to Default</Button>
        <Button color="red" onClick={() => handleResetToDefault('description')}>Reset Description to Default</Button>
      </Group>
    </Container>
  );
};

export default EditHomePage;