import { Box, Heading, Text, Button, VStack, Container } from "@chakra-ui/react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const MotionBox = motion(Box);

const Home = () => {
    return (
        <Container maxW="container.xl" h="80vh" display="flex" alignItems="center" justifyContent="center">
            <VStack spacing={8} textAlign="center">
                <MotionBox
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <Heading as="h1" size="2xl" mb={4} bgGradient="linear(to-l, #7928CA, #FF0080)" bgClip="text">
                        Track Your Bus in Real-Time
                    </Heading>
                    <Text fontSize="xl" color="gray.500">
                        Never miss a ride again. Live tracking, accurate ETAs, and reliable transit data at your fingertips.
                    </Text>
                </MotionBox>

                <MotionBox
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5, duration: 0.8 }}
                >
                    <Button as={Link} to="/dashboard" colorScheme="purple" size="lg" px={10}>
                        Start Tracking
                    </Button>
                </MotionBox>
            </VStack>
        </Container>
    );
};

export default Home;
