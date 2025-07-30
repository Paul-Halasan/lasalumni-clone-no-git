import React, { useState, useEffect, useRef } from "react";
import { Flex, Text } from "@mantine/core";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";

interface ResumeTabProps {
  resumeUrl: string;
}

const ResumeTab: React.FC<ResumeTabProps> = ({ resumeUrl }) => {
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handlePreviousPage = () => {
    // Logic for handling previous page if needed
  };

  const handleNextPage = () => {
    // Logic for handling next page if needed
  };

  return (
    <Flex
      style={{
        padding: "10px",
        border: "1px solid #ccc",
        borderRadius: "8px",
        width: "100%",
        margin: "0 auto",
        boxShadow: "0 8px 16px rgba(0, 0, 0, 0.2)",
        flexDirection: "column",
      }}
    >
      {resumeUrl ? (
        <div
          ref={containerRef}
          className="pdf-container"
          style={{ width: "100%", position: "relative" }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <iframe
            src={resumeUrl}
            style={{ width: "100%", height: "600px", border: "none" }}
            title="Resume PDF"
          />
          {isHovered && (
            <Flex
              justify="space-between"
              align="center"
              direction="row"
              style={{
                padding: "5px",
                border: "1px solid #ccc",
                borderRadius: "8px",
                boxShadow: "0 8px 16px rgba(0, 0, 0, 0.2)",
                width: "fit-content",
                position: "absolute",
                bottom: "10px",
                left: "50%",
                transform: "translateX(-50%)",
                backgroundColor: "white",
              }}
            >
              <button
                onClick={handlePreviousPage}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "40px",
                  height: "40px",
                  border: "none",
                  background: "none",
                  cursor: "pointer",
                }}
              >
                <IconChevronLeft size={24} />
              </button>
              <span style={{ fontSize: "12px" }}>Page Navigation</span>
              <button
                onClick={handleNextPage}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "40px",
                  height: "40px",
                  border: "none",
                  background: "none",
                  cursor: "pointer",
                }}
              >
                <IconChevronRight size={24} />
              </button>
            </Flex>
          )}
        </div>
      ) : (
        <Text>No PDF file specified.</Text>
      )}
    </Flex>
  );
};

export default ResumeTab;