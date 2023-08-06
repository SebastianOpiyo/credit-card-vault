import React from "react";
import { Box, Text } from "@chakra-ui/react";
import { formContainerStyle } from "../assets/styles";

const Home = () => {
  const titleStyle = {
    fontSize: "48px",
    fontWeight: "bold",
    color: "#112233", // Replace with your desired color
    textTransform: "uppercase",
    marginBottom: "20px",
  };

  return (
    <Box {...formContainerStyle}>
      <Text {...titleStyle}>E-Commerce Credit Card Vault</Text>
    </Box>
  );
};

export default Home;