import React, { useEffect, useState } from "react";
import { useAuth } from "../contextt/AuthContext"; // AuthContext hook
import axios from "axios";
import {
  Box,
  Button,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  FormControl,
  FormLabel,
  Input,
} from "@chakra-ui/react";

const Dashboard = () => {
  const [users, setUsers] = useState([]);
  const { token } = useAuth();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedCreditCard, setSelectedCreditCard] = useState(null);
  const [editedCardNumber, setEditedCardNumber] = useState("");

  useEffect(() => {
    axios
      .get("http://localhost:8000/api/v1/users", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        setUsers(response.data);
      })
      .catch((error) => {
        console.error(error);
      });
  }, [token]);

  const handleViewCreditCard = (user, card) => {
    setSelectedUser(user);
    setSelectedCreditCard(card);
    onOpen();
  };

  const handleEditCreditCard = (user, card) => {
    setSelectedUser(user);
    setSelectedCreditCard(card);
    setEditedCardNumber(card.card_number);
    onOpen();
  };

  const handleSaveEdit = () => {
    // Update the credit card information in the server here
    // You can use axios.patch() or axios.put() to update the data
    // For this example, we're just updating the state to reflect the changes
    const updatedUsers = users.map((user) => {
      if (user.id === selectedUser.id) {
        const updatedCreditCards = user.credit_cards.map((card) => {
          if (card.id === selectedCreditCard.id) {
            return { ...card, card_number: editedCardNumber };
          }
          return card;
        });
        return { ...user, credit_cards: updatedCreditCards };
      }
      return user;
    });
    setUsers(updatedUsers);
    onClose();
  };

  return (
    <Box p="4" boxShadow="md" borderRadius="md">
      <Text fontSize="xl" fontWeight="bold">Dashboard</Text>
      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>Username</Th>
            <Th>Credit Cards</Th>
            <Th>Actions</Th>
          </Tr>
        </Thead>
        <Tbody>
          {users.map((user) => (
            <Tr key={user.username}>
              <Td>{user.username}</Td>
              <Td>
                <ul>
                  {user.credit_cards.map((card) => (
                    <li key={card.id}>
                      {card.card_number}{" "}
                      <Button
                        size="sm"
                        colorScheme="blue"
                        mr="2"
                        onClick={() => handleViewCreditCard(user, card)}
                      >
                        View
                      </Button>
                      <Button
                        size="sm"
                        colorScheme="teal"
                        mr="2"
                        onClick={() => handleEditCreditCard(user, card)}
                      >
                        Edit
                      </Button>
                      {/* Add a Delete button here if you want to handle card deletion */}
                    </li>
                  ))}
                </ul>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>

      {/* View/Edit Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="md">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {selectedUser && selectedCreditCard
              ? `Credit Card Information (${selectedCreditCard.card_number})`
              : ""}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedUser && selectedCreditCard && (
              <>
                <Text fontWeight="bold">Credit Card Number:</Text>
                <Text>{selectedCreditCard.card_number}</Text>
                {/* Add more credit card information here if needed */}
                <FormControl mt="4">
                  <FormLabel>Edit Card Number</FormLabel>
                  <Input
                    type="text"
                    value={editedCardNumber}
                    onChange={(e) => setEditedCardNumber(e.target.value)}
                  />
                </FormControl>
              </>
            )}
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="teal" mr={3} onClick={handleSaveEdit}>
              Save
            </Button>
            <Button colorScheme="blue" onClick={onClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default Dashboard;
