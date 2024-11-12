module.exports = function override(config, env) {
    config.module.rules = [
        ...config.module.rules, 
        {
            test: /\.m?js/,
            resolve: {
              fullySpecified: false
            }
        }
    ]
    return config
}
