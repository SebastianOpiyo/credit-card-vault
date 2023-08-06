import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from "../contextt/AuthContext"; // AuthContext hook
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
} from "@chakra-ui/react";

const UserCreditCards = () => {
  const [creditCards, setCreditCards] = useState([]);
  // Access the token from the AuthContext
  const { token } = useAuth();

  useEffect(() => {
    axios
      .get('http://localhost:8000/api/v1/credit-cards', { 
        headers: { Authorization: `Bearer ${token}` }
      })
      .then((response) => {
        setCreditCards(response.data.credit_cards);
      })
      .catch((error) => {
        console.error(error);
      });
  }, [token]);

  const handleDeleteCreditCard = (cardId) => {
    axios
      .delete(`http://localhost:8000/api/v1/credit-cards/${cardId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then((response) => {
        // Remove the deleted credit card from the state
        setCreditCards(creditCards.filter((card) => card.id !== cardId));
      })
      .catch((error) => {
        console.error(error);
      });
  };

  return (
    <Box p="4" boxShadow="md" borderRadius="md">
      <Text fontSize="xl" fontWeight="bold">Your Credit Cards</Text>
      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>Card Number</Th>
            <Th>Actions</Th>
          </Tr>
        </Thead>
        <Tbody>
          {creditCards.map((card) => (
            <Tr key={card.id}>
              <Td>{card.card_number}</Td>
              <Td>
                <Button
                  colorScheme="red"
                  size="sm"
                  onClick={() => handleDeleteCreditCard(card.id)}
                >
                  Delete
                </Button>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Box>
  );
};

export default UserCreditCards;
