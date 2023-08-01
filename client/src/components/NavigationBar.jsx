import { Button, Flex, Stack, Text } from "@chakra-ui/react";
import { Link } from "react-router-dom";

const NavigationBar = () => {
  return (
    <>
      <Stack>
        <Flex p={5} justify="space-between" bgColor="gray.200" boxShadow="md">
          <Text>Vault</Text>
          <Flex gap={5}>
            <Link to="/">Home</Link>
            <Link to="/dashboard">Dashboard</Link>
            <Link to="/user-credit-cards">Credit</Link>
          </Flex>
          <Flex gap={5} align="center">
            <Link to="/login">Login</Link>

            <Link to="/signup">
              <Button
                variant="filled"
                bg="blue.500"
                borderRadius={"20px"}
                color="white"
              >
                register
              </Button>
            </Link>
          </Flex>
        </Flex>
      </Stack>
    </>
  );
};

export default NavigationBar;
