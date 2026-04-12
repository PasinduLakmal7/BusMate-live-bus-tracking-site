import React from 'react';
import { 
    FormControl, FormErrorMessage, FormLabel, Input, 
    InputGroup, InputLeftElement 
} from '@chakra-ui/react';
import { useField } from 'formik';

const TextField = ({ label, leftIcon, ...props }) => {
    const [field, meta] = useField(props);
    return (
        <FormControl isInvalid={meta.touched && meta.error} className="w-full">
            {label && <FormLabel className="dark:text-white/70">{label}</FormLabel>}
            <InputGroup size="lg">
                {leftIcon && (
                    <InputLeftElement pointerEvents="none" height="100%" display="flex" alignItems="center" pb="6">
                        {leftIcon}
                    </InputLeftElement>
                )}
                <Input
                    {...field}
                    {...props}
                    variant="flushed"
                    className="!border-0 !border-b-2 !rounded-none !text-xl !bg-transparent !pb-6 !pl-12 transition-all
                               text-slate-900 dark:text-white 
                               border-slate-400 dark:border-white/30 
                               focus:border-blue-600 dark:focus:border-white"
                />
            </InputGroup>
            <FormErrorMessage className="font-bold text-red-500">{meta.error}</FormErrorMessage>
        </FormControl>
    );
};

export default TextField;