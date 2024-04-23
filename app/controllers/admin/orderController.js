const Order = require("../../models/order"); 

exports.Index = async (req, res, next) => {
    const page = req.query.page || 1;
    try {
        const totalDocuments = await Order.countDocuments();
        const totalPages = Math.ceil(
            totalDocuments / +process.env.PAGINATION_PER_PAGE
        );
        const orders = await Order.find({deletedAt:null}) 
            .sort({ createdAt: -1 })
            .skip((page - 1) * +process.env.PAGINATION_PER_PAGE)
            .limit(+process.env.PAGINATION_PER_PAGE);
        res.status(200).json({
            data: orders,
            pagination: {
                links: {
                    first: `${req.protocol}://${req.get(
                        "host"
                    )}/shop/orders?page=1`,
                    last: `${req.protocol}://${req.get(
                        "host"
                    )}/shop/orders?page=${
                        totalPages > 1 ? totalPages : 1
                    }`,
                    prev:
                        page > 1
                            ? `${req.protocol}://${req.get(
                                "host"
                                )}/shop/orders?page=${page - 1}`
                            : null,
                    next:
                        page < totalPages
                            ? `${req.protocol}://${req.get(
                                "host"
                                )}/shop/orders?page=${page + 1}`
                            : null
                },
                meta: {
                    currentPage: page,
                    last_page: totalPages > 1 ? totalPages : 1,
                    items_per_page: +process.env.PAGINATION_PER_PAGE,
                    total_items: totalDocuments,
                    total_pages: totalPages > 1 ? totalPages : 1
                }
            }
        });
    } catch (err) {
        const error = new Error(err);
        error.statusCode = err.statusCode || 500;
        return next(error);
    }
}; 