import React, { useEffect } from 'react';
import {
    VStack, Box, Button, Checkbox, Text, Link, Avatar, Flex, useColorMode
} from '@chakra-ui/react';
import { EmailIcon, LockIcon, InfoOutlineIcon } from '@chakra-ui/icons';
import { Link as RouterLink } from 'react-router-dom';
import { Formik } from 'formik';
import TextField from './TextField';
import { formSchema } from "@busmate/common";


const Register = () => {
    const { colorMode } = useColorMode();

    useEffect(() => {
        document.documentElement.classList.toggle('dark', colorMode === 'dark');
    }, [colorMode]);

    return (
        <Formik
            initialValues={{ username: "", email: "", password: "", confirmPassword: "" }}
            validationSchema={formSchema}
            onSubmit={(values, action) => {
                const vals = { ...values }
                action.resetForm();
                fetch("/api/auth/register", {
                    method: "POST",
                    credential: "include",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(vals),
                })
                    .catch(error => {
                        return;
                    })
                    .then(res => {
                        if (!res || !res.ok || res.status >= 400) {
                            return;
                        }
                        return res.json();
                    })
                    .then(data => {
                        if (!data) return;
                        console.log(data)
                    });
            }}
        >
            {(formik) => (
                <div
                    style={{ backgroundColor: colorMode === 'dark' ? '#0f172a' : '#f8fafc' }}
                    className="min-h-screen w-full flex items-center justify-center p-6 relative overflow-hidden transition-colors duration-500"
                >
                    {/* Background Blobs */}
                    {colorMode === 'dark' && (
                        <>
                            <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-900/30 rounded-full blur-[120px]" />
                            <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-900/30 rounded-full blur-[120px]" />
                        </>
                    )}

                    <VStack
                        as="form"
                        onSubmit={formik.handleSubmit}
                        className="w-full max-w-[550px] p-12 space-y-8 rounded-[3.5rem] z-10 shadow-2xl transition-all duration-500 
                                   bg-white/80 dark:bg-white/[0.07] backdrop-blur-[25px] 
                                   border border-slate-200 dark:border-white/20"
                    >
                        <Box className="p-5 rounded-full border shadow-inner bg-slate-200/50 dark:bg-white/10 border-slate-300 dark:border-white/10">
                            <Avatar size="xl" icon={<Box className="text-6xl">📝</Box>} bg="transparent" />
                        </Box>

                        <VStack spacing={6} className="w-full">
                            <TextField
                                name="username"
                                placeholder="Username"
                                leftIcon={<InfoOutlineIcon className="text-slate-600 dark:text-white/70" w={5} h={5} />}
                            />

                            <TextField
                                name="email"
                                type="email"
                                placeholder="Email ID"
                                leftIcon={<EmailIcon className="text-slate-600 dark:text-white/70" w={5} h={5} />}
                            />

                            <TextField
                                name="password"
                                type="password"
                                placeholder="Password"
                                leftIcon={<LockIcon className="text-slate-600 dark:text-white/70" w={5} h={5} />}
                            />

                            <TextField
                                name="confirmPassword"
                                type="password"
                                placeholder="Confirm Password"
                                leftIcon={<LockIcon className="text-slate-600 dark:text-white/70" w={5} h={5} />}
                            />
                        </VStack>

                        <Flex className="w-full">
                            <Checkbox colorScheme="blue" size="lg" isRequired>
                                <Text className="text-sm font-medium text-slate-800 dark:text-white/70">
                                    I agree to the <Link color="blue.500">Terms & Conditions</Link>
                                </Text>
                            </Checkbox>
                        </Flex>

                        <VStack spacing={4} className="w-full">
                            <Button
                                type="submit"
                                isLoading={formik.isSubmitting}
                                className="!w-full !rounded-2xl !h-16 !text-white shadow-xl border border-white/10 transition-all hover:scale-[1.02] active:scale-[0.98]
                                           !bg-gradient-to-r !from-[#4e0329] !via-[#3b0764] !to-[#1e3a8a]"
                            >
                                <Text className="text-xl font-bold tracking-[3px]">SIGN UP</Text>
                            </Button>

                            <Text className="text-md text-slate-700 dark:text-white/70">
                                Already have an account?{" "}
                                <Link as={RouterLink} to="/login" className="font-bold text-blue-700 dark:text-white hover:underline">
                                    Login here
                                </Link>
                            </Text>
                        </VStack>
                    </VStack>
                </div>
            )}
        </Formik>
    );
};

export default Register;