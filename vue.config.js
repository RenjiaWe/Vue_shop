module.exports = {
  publicPath: process.env.NODE_ENV === 'production'
    ? '/vue_shop/' // vue_shop 為 repo 名稱
    : '/'
}