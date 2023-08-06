// Add credit card form
import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from "../contextt/AuthContext"; // AuthContext hook
import {
  Box,
  Button,
  Center,
  FormControl,
  FormLabel,
  Input,
  VStack,
} from "@chakra-ui/react";

const CreditCard = () => {
  const [cardNumber, setCardNumber] = useState('');
  const [cvv, setCvv] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  // Access the token from the AuthContext
  const { token } = useAuth()

  const handleAddCreditCard = () => {
    axios
      .post(
        'http://localhost:8000/api/v1/credit-cards', 
        { card_number: cardNumber, cvv: cvv, expiry_date: expiryDate },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}` // Include the token in the headers
          }
        }
      )
      .then((response) => {
        console.log(response.data);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  return (
    <Center minH="100vh">
      <Box p="4" boxShadow="md" borderRadius="md" w="300px">
        <VStack spacing="4">
          <FormLabel>Credit Card Information</FormLabel>
          <FormControl>
            <Input
              type="text"
              placeholder="Card Number"
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value)}
            />
          </FormControl>
          <FormControl>
            <Input
              type="text"
              placeholder="CVV"
              value={cvv}
              onChange={(e) => setCvv(e.target.value)}
            />
          </FormControl>
          <FormControl>
            <Input
              type="text"
              placeholder="Expiry Date"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
            />
          </FormControl>
          <Button colorScheme="blue" onClick={handleAddCreditCard}>
            Add Credit Card
          </Button>
        </VStack>
      </Box>
    </Center>
  );
};

export default CreditCard;
