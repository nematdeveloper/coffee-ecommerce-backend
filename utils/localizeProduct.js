const t = (obj, lang = 'en', fallback = '') => obj?.[lang] ?? obj?.en ?? fallback;

const localizeProduct = (product, lang = 'en') => ({
  _id: product._id,
  productname: t(product.productname, lang),
  productamount: product.productamount,
  productPrice: product.productPrice,
  discountPrice: product.discountPrice,
  stock: product.stock,
  productDescription: t(product.productDescription, lang),
  productImage: product.productImage,
  productDetailsImages: product.productDetailsImages?.map(img => ({
    url: img.url,
    alt: t(img.alt, lang)
  })) || [],
  type: t(product.type, lang),
  createdAt: product.createdAt,
  updatedAt: product.updatedAt
});

const localizeProducts = (products, lang = 'en') => products.map(p => localizeProduct(p, lang));

module.exports = { localizeProduct, localizeProducts };
