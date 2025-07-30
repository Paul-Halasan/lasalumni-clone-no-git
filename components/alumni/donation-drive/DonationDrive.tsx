import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  SimpleGrid,
  Card,
  Image,
  Text,
  Container,
  AspectRatio,
  Modal,
  Button,
  Group,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import styles from '../events/EventCard.module.css';

interface DonationDrive {
  dd_listID: string;
  dd_title: string;
  dd_image: string;
  dd_desc: string;
  submitted_by: string;
  isApproved: boolean;
}

interface UserProfile {
  last_name: string;
  first_name: string;
  middle_name: string;
}

const DonationDrive: React.FC = () => {
  const [opened, { open, close }] = useDisclosure(false);
  const [selectedDrive, setSelectedDrive] = useState<DonationDrive | null>(null);
  const [donationDrives, setDonationDrives] = useState<DonationDrive[]>([]);
  const [userProfiles, setUserProfiles] = useState<{ [key: string]: UserProfile }>({});

  const fetchDonationDrives = async () => {
    try {
      const response = await axios.get('/api/get_donation_drives');
      setDonationDrives(response.data.donationDrives);
    } catch (error) {
      console.error('Error fetching donation drives:', error);
    }
  };

  const fetchUserProfile = async (userID: string) => {
    try {
      const response = await axios.get('/api/get_user_profile', { params: { userID } });
      setUserProfiles(prevProfiles => ({
        ...prevProfiles,
        [userID]: response.data.userProfile,
      }));
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  useEffect(() => {
    fetchDonationDrives();
  }, []);

  useEffect(() => {
    donationDrives.forEach(drive => {
      if (!userProfiles[drive.submitted_by]) {
        fetchUserProfile(drive.submitted_by);
      }
    });
  }, [donationDrives]);

  const handleCardClick = (drive: DonationDrive) => {
    setSelectedDrive(drive);
    open();
  };

  const approvedDonationDrives = donationDrives.filter(drive => drive.isApproved);

  const cards = approvedDonationDrives.map(drive => (
    <Card
      key={drive.dd_listID}
      p="md"
      radius="md"
      component="a"
      href="#"
      className={styles.card}
      onClick={() => handleCardClick(drive)}
    >
      <AspectRatio ratio={1920 / 1080}>
        <Image src={`https://lasalumni-bucket.s3.ap-southeast-2.amazonaws.com/${drive.dd_image}`} />
      </AspectRatio>

      <Text c="dimmed" size="xs" tt="uppercase" fw={700} mt="md">
        PROMOTED BY: {userProfiles[drive.submitted_by]?.last_name}, {userProfiles[drive.submitted_by]?.first_name} {userProfiles[drive.submitted_by]?.middle_name}
      </Text>

      <Text className={styles.title} mt={5}>
        {drive.dd_title}
      </Text>

      <Button
        variant="outline"
        color="blue"
        mt="md"
        fullWidth
        onClick={(e) => {
          e.stopPropagation(); // Prevent the card click event from firing
          handleCardClick(drive);
        }}
      >
        More Information
      </Button>
    </Card>
  ));

  return (
    <div>
      <Modal
        opened={opened}
        onClose={close}
        title={selectedDrive?.dd_title || "Modal title"}
        centered
      >
        {selectedDrive && (
          <div>
            <Text>{selectedDrive.dd_desc}</Text>
          </div>
        )}
      </Modal>

      <Container py="xl">
        <SimpleGrid cols={{ base: 1, sm: 2 }}>{cards}</SimpleGrid>
      </Container>
    </div>
  );
};

export default DonationDrive;