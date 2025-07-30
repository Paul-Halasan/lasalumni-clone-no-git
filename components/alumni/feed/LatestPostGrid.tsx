import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Container,
  Card,
  Text,
  Stack,
  Spoiler,
  SimpleGrid,
  Modal,
  Image,
  Button,
  ActionIcon,
} from "@mantine/core";
import { formatDistanceToNow } from "date-fns";
import ReactMarkdown from "react-markdown";
import Masonry from "react-masonry-css";
import classes from "./LatestPostGrid.module.css";
import { IconChevronRight, IconChevronLeft } from "@tabler/icons-react";

const LatestPostGrid = () => {
  const [posts, setPosts] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedAlbum, setSelectedAlbum] = useState<string[] | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);

  useEffect(() => {
    const fetchPosts = async () => {
      const PAGE_ID = "107151108550609";
      const ACCESS_TOKEN =
        "EAAMWqKsltC8BPD5ZA8D83DwnEOPLZAPvVA7pI5XAc5PdP9obuwWDxiVoxdGHwTcxjzY1NxRkUTFGmDcZAN8D26nU4PECIyrxZCv3HuZATEhrXEC45drmrvZAnRtvDxP4V8jOLtojyHfJyZAnlQq7bYTa6lJlCZCuYCUtgYKnTzZCZChqZBP6f4Uydx5TIalk6V6zjzxZAZCd6pU0ZD";
      const FACEBOOK_GRAPH_URL = `https://graph.facebook.com/v12.0/${PAGE_ID}/posts?access_token=${ACCESS_TOKEN}&fields=id`;

      try {
        const response = await axios.get(FACEBOOK_GRAPH_URL);
        const posts = response.data.data;

        const postsWithDetails = await Promise.all(
          posts.map(async (post: { id: string }) => {
            const postDetailsResponse = await axios.get(
              `https://graph.facebook.com/v12.0/${post.id}?access_token=${ACCESS_TOKEN}&fields=permalink_url,message,full_picture,from,created_time,attachments,event`
            );
            const profileResponse = await axios.get(
              `https://graph.facebook.com/v12.0/${postDetailsResponse.data.from.id}/picture?access_token=${ACCESS_TOKEN}&redirect=false`
            );
            return {
              ...postDetailsResponse.data,
              profilePicture: profileResponse.data.data.url,
            };
          })
        );

        setPosts(postsWithDetails);
      } catch (error) {
        console.error("Error fetching posts:", error);
        setError("Error fetching posts");
      }
    };

    fetchPosts();
  }, []);

  const handleImageClick = (
    src: string,
    album: string[] | null = null,
    index: number = 0
  ) => {
    setSelectedImage(src);
    setSelectedAlbum(album);
    setSelectedImageIndex(index);
    setModalOpen(true);
  };

  const handleNextImage = () => {
    if (selectedAlbum && selectedImageIndex < selectedAlbum.length - 1) {
      setSelectedImageIndex(selectedImageIndex + 1);
      setSelectedImage(selectedAlbum[selectedImageIndex + 1]);
    }
  };

  const handlePrevImage = () => {
    if (selectedAlbum && selectedImageIndex > 0) {
      setSelectedImageIndex(selectedImageIndex - 1);
      setSelectedImage(selectedAlbum[selectedImageIndex - 1]);
    }
  };

  if (error) {
    return <p>{error}</p>;
  }

  if (posts.length === 0) {
    return <p>No posts found.</p>;
  }

  const breakpointColumnsObj = {
    default: 3,
    1100: 2,
    700: 1,
  };

  return (
    <>
      <Container size="xl" style={{ height: "100%" }} pt={30}>
        <Masonry
          breakpointCols={breakpointColumnsObj}
          className={classes.mymasonrygrid}
          columnClassName={classes.mymasonrygridcolumn}
        >
          {posts.map((post) => (
            <Card
              key={post.id}
              shadow="md"
              padding="xl"
              radius="md"
              style={{
                backgroundColor: "white",
                borderRadius: "10px",
                border: "1px solid #e0e0e0",
                height: "auto",
                marginBottom: "20px",
                width: "100%",
              }}
            >
              <div className="facebook-post">
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    marginBottom: "15px",
                  }}
                >
                  <img
                    src={post.profilePicture}
                    alt="Profile"
                    style={{
                      borderRadius: "50%",
                      width: "40px",
                      height: "40px",
                      marginRight: "10px",
                    }}
                  />
                  <Stack gap={0}>
                    <Text style={{ fontWeight: "bold" }}>{post.from.name}</Text>
                    <Text style={{ fontSize: "12px", color: "#666" }}>
                      {formatDistanceToNow(new Date(post.created_time), {
                        addSuffix: true,
                      })}
                    </Text>
                  </Stack>
                </div>
  
                {post.message && (
                  <div
                    className={classes.lineClamp}
                    style={{
                      fontSize: "14px",
                      color: "#333",
                      marginBottom: "10px",
                      lineHeight: "1.6",
                      padding: 0,
                    }}
                  >
                    <Spoiler
                      maxHeight={200}
                      showLabel="Show more"
                      hideLabel="Hide"
                      mb={40}
                    >
                      <ReactMarkdown>{post.message}</ReactMarkdown>
                    </Spoiler>
                  </div>
                )}
  
                {post.attachments && post.attachments.data.length > 0 && (
                  <SimpleGrid
                    cols={
                      post.attachments.data.some(
                        (attachment: any) => attachment.type === "album"
                      )
                        ? 2
                        : 1
                    }
                    spacing="xs"
                  >
                    {(() => {
                      let hasMedia = false;
  
                      const mediaElements = post.attachments.data.map(
                        (attachment: any) => {
                          if (attachment.type === "photo") {
                            hasMedia = true;
                            return (
                              <button
                                key={attachment.media.image.src}
                                style={{
                                  width: "100%",
                                  height: "auto",
                                  objectFit: "cover",
                                  borderRadius: "8px",
                                  cursor: "pointer",
                                  background: "none",
                                  border: "none",
                                  padding: 0,
                                }}
                                onClick={() =>
                                  handleImageClick(attachment.media.image.src)
                                }
                              >
                                <img
                                  src={attachment.media.image.src}
                                  alt="Post"
                                  style={{
                                    width: "100%",
                                    height: "auto",
                                    objectFit: "cover",
                                    borderRadius: "8px",
                                  }}
                                />
                              </button>
                            );
                          }
  
                          if (attachment.type === "album") {
                            hasMedia = true;
                            const subAttachments =
                              attachment.subattachments.data;
                            const maxDisplay = 4;
                            const albumImages = subAttachments.map(
                              (subAttachment: any) =>
                                subAttachment.media.image.src
                            );
  
                            return subAttachments
                              .slice(0, maxDisplay)
                              .map((subAttachment: any, index: number) => {
                                if (
                                  index < maxDisplay - 1 ||
                                  subAttachments.length <= maxDisplay
                                ) {
                                  return (
                                    <button
                                      key={subAttachment.media.image.src}
                                      style={{
                                        width: "100%",
                                        height: "auto",
                                        objectFit: "cover",
                                        borderRadius: "8px",
                                        cursor: "pointer",
                                        background: "none",
                                        border: "none",
                                        padding: 0,
                                      }}
                                      onClick={() =>
                                        handleImageClick(
                                          subAttachment.media.image.src,
                                          albumImages,
                                          index
                                        )
                                      }
                                    >
                                      <img
                                        src={subAttachment.media.image.src}
                                        alt="Post"
                                        style={{
                                          width: "100%",
                                          height: "auto",
                                          objectFit: "cover",
                                          borderRadius: "8px",
                                        }}
                                      />
                                    </button>
                                  );
                                } else if (index === maxDisplay - 1) {
                                  const remainingCount =
                                    subAttachments.length - maxDisplay + 1;
                                  return (
                                    <button
                                      key={subAttachment.media.image.src}
                                      style={{
                                        width: "100%",
                                        height: "auto",
                                        position: "relative",
                                        borderRadius: "8px",
                                        overflow: "hidden",
                                        cursor: "pointer",
                                        background: "none",
                                        border: "none",
                                        padding: 0,
                                      }}
                                      onClick={() =>
                                        handleImageClick(
                                          subAttachment.media.image.src,
                                          albumImages,
                                          index
                                        )
                                      }
                                    >
                                      <img
                                        src={subAttachment.media.image.src}
                                        alt="Post"
                                        style={{
                                          width: "100%",
                                          height: "auto",
                                          objectFit: "cover",
                                          filter: "brightness(50%)",
                                        }}
                                      />
                                      <div
                                        style={{
                                          position: "absolute",
                                          top: "50%",
                                          left: "50%",
                                          transform: "translate(-50%, -50%)",
                                          color: "white",
                                          fontSize: "12px",
                                          fontWeight: "bold",
                                        }}
                                      >
                                        +{remainingCount} more
                                      </div>
                                    </button>
                                  );
                                }
                                return null;
                              });
                          }
  
                          if (
                            attachment.type === "video_inline" ||
                            attachment.type === "video"
                          ) {
                            hasMedia = true;
                            return (
                              <iframe
                                key={attachment.media.source}
                                src={attachment.media.source}
                                style={{
                                  width: "100%",
                                  height: "auto",
                                  borderRadius: "8px",
                                  marginBottom: "15px",
                                  marginTop: "15px",
                                }}
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                                onError={(e) =>
                                  console.error("Error loading video:", e)
                                }
                              />
                            );
                          }
  
                          if (attachment.type === "event") {
                            hasMedia = true;
                            return (
                              <div key={attachment.target.id}>
                                <Text style={{ fontWeight: "bold" }}>
                                  {attachment.title}
                                </Text>
                                <Text>{attachment.description}</Text>
                                <Text>
                                  {new Date(
                                    attachment.start_time
                                  ).toLocaleString()}
                                </Text>
                              </div>
                            );
                          }
  
                          return null;
                        }
                      );
  
                      if (!hasMedia) {
                        return (
                          <button
                            style={{
                              width: "100%",
                              height: "auto",
                              objectFit: "cover",
                              borderRadius: "8px",
                              cursor: "pointer",
                              background: "none",
                              border: "none",
                              padding: 0,
                            }}
                            onClick={() => handleImageClick(post.full_picture)}
                          >
                            <img
                              src={post.full_picture}
                              alt="Post"
                              style={{
                                width: "100%",
                                height: "auto",
                                objectFit: "cover",
                                borderRadius: "8px",
                              }}
                            />
                          </button>
                        );
                      }
  
                      return mediaElements;
                    })()}
                  </SimpleGrid>
                )}
                <a
                  href={post.permalink_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "inline-block",
                    color: "#1d72b8",
                    textDecoration: "none",
                    fontWeight: "bold",
                    marginTop: "10px",
                  }}
                >
                  View on Facebook
                </a>
              </div>
            </Card>
          ))}
        </Masonry>
      </Container>
  
      <Modal
        opened={modalOpen}
        onClose={() => setModalOpen(false)}
        size="auto"
        centered
      >
        <div style={{ position: "relative" }}>
          {selectedImage && <Image src={selectedImage} alt="Selected Post" />}
          {selectedAlbum && (
            <>
              <ActionIcon
                variant="filled"
                size="xxl"
                radius="xl"
                color="black"
                onClick={handlePrevImage}
                disabled={selectedImageIndex === 0}
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "10px",
                  transform: "translateY(-50%)",
                  zIndex: 10,
                }}
              >
                <IconChevronLeft size={32} />
              </ActionIcon>
              <ActionIcon
                variant="filled"
                size="xxl"
                radius="xl"
                color="black"
                onClick={handleNextImage}
                disabled={selectedImageIndex === selectedAlbum.length - 1}
                style={{
                  position: "absolute",
                  top: "50%",
                  right: "10px",
                  transform: "translateY(-50%)",
                  zIndex: 10,
                }}
              >
                <IconChevronRight size={32} />
              </ActionIcon>
            </>
          )}
        </div>
      </Modal>
    </>
  )};

export default LatestPostGrid;