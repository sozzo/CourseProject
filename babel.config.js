module.exports = {
    presets: ['@babel/preset-react', '@babel/preset-env'],
    plugins: ["@babel/plugin-proposal-export-default-from"],
    env: {
        test: {
            presets: ['babel-preset-next']
        },
    }
}