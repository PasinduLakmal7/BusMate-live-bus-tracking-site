export default {
    plugins: {
        "@tailwindcss/postcss": {},
        "postcss-preset-env": {
            features: {
                'nesting-rules': true,
                'media-query-ranges': true
            }
        },
        "@csstools/postcss-cascade-layers": {},
        "autoprefixer": {},
    },
}
