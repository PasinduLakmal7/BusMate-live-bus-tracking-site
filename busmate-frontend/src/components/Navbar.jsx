import { Flex, Box, Heading, Button, Spacer, Link as ChakraLink } from "@chakra-ui/react";
import { Link } from "react-router-dom";
import ToggleColorMode from "./ToggleColorMode";

const Navbar = () => {
    return (
        <Flex as="nav" p={4} align="center" borderBottom="1px" borderColor="gray.200">
            <Heading size="md">
                <ChakraLink as={Link} to="/" _hover={{ textDecoration: "none" }}>BusMate</ChakraLink>
            </Heading>
            <Spacer />
            <Box>
                <Button as={Link} to="/" variant="ghost" mr={2}>Home</Button>
                <Button as={Link} to="/dashboard" variant="ghost" mr={2}>Dashboard</Button>
                <Button as={Link} to="/login" variant="ghost" mr={2}>Login</Button>
                <Button as={Link} to="/register" colorScheme="blue" mr={2}>Sign Up</Button>
                <ToggleColorMode />
            </Box>
        </Flex>
    );
};

export default Navbar;
