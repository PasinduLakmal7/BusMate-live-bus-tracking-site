import React, { useEffect } from 'react';
import {
    VStack, Box, Button, Checkbox, Text, Link, Avatar, Flex, useColorMode
} from '@chakra-ui/react';
import { EmailIcon, LockIcon } from '@chakra-ui/icons';
import { Link as RouterLink } from 'react-router-dom';
import { Formik } from 'formik';
import TextField from './TextField';
import { loginSchema } from "@busmate/common";


const Login = () => {
    const { colorMode } = useColorMode();

    useEffect(() => {
        document.documentElement.classList.toggle('dark', colorMode === 'dark');
    }, [colorMode]);

    return (
        <Formik
            initialValues={{ email: "", password: "" }}
            validationSchema={loginSchema}

            //data send to backend
            onSubmit={(values, action) => {
                const vals = { ...values }
                action.resetForm();
                fetch("http://localhost:4000/auth/login", {
                    method: "POST",
                    credentials: "include",
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
                <div style={{ backgroundColor: colorMode === 'dark' ? '#0f172a' : '#f8fafc' }}
                    className="min-h-screen w-full flex items-center justify-center p-6 relative overflow-hidden transition-colors duration-500">

                    {colorMode === 'dark' && (
                        <>
                            <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-900/30 rounded-full blur-[120px]" />
                            <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-900/30 rounded-full blur-[120px]" />
                        </>
                    )}

                    <VStack as="form" onSubmit={formik.handleSubmit}
                        className="w-full max-w-[500px] p-16 space-y-10 rounded-[3.5rem] z-10 shadow-2xl bg-white/80 dark:bg-white/[0.07] backdrop-blur-[25px] border border-slate-200 dark:border-white/20">

                        <Box className="p-6 rounded-full border shadow-inner bg-slate-200/50 dark:bg-white/10 border-slate-300 dark:border-white/10">
                            <Avatar size="2xl" icon={<Box className="text-7xl">👤</Box>} bg="transparent" />
                        </Box>

                        <VStack spacing={8} className="w-full">
                            <TextField
                                name="email"
                                placeholder="Email ID"
                                leftIcon={<EmailIcon className="text-slate-600 dark:text-white/70" w={6} h={6} />}
                            />

                            <TextField
                                name="password"
                                type="password"
                                placeholder="Password"
                                leftIcon={<LockIcon className="text-slate-600 dark:text-white/70" w={6} h={6} />}
                            />
                        </VStack>

                        <Flex className="w-full justify-between items-center text-slate-700 dark:text-white/60">
                            <Checkbox colorScheme="blue" size="lg"><Text className="text-md font-medium">Remember me</Text></Checkbox>
                            <Link className="text-md italic font-medium hover:text-blue-600 dark:hover:text-white">Forgot Password?</Link>
                        </Flex>

                        <VStack spacing={4} className="w-full">
                            <Button type="submit" isLoading={formik.isSubmitting}
                                className="!w-full !rounded-2xl !h-16 !text-white shadow-xl !bg-gradient-to-r !from-[#4e0329] !via-[#3b0764] !to-[#1e3a8a] hover:scale-[1.02] active:scale-[0.98]">
                                <Text className="text-xl font-bold tracking-[3px]">LOGIN</Text>
                            </Button>
                            <Text className="text-md dark:text-white/70">
                                Don't have an account? <Link as={RouterLink} to="/register" className="font-bold text-blue-700 dark:text-white">Register here</Link>
                            </Text>
                        </VStack>
                    </VStack>
                </div>
            )}
        </Formik>
    );
};

export default Login;