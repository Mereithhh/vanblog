docker run --rm -it --name vanblog-test -p 888:80 \
-e VAN_BLOG_DATABASE_URL="mongodb://mereith:vanlusg2!@tx1.mereith.top:27017/vanBlog1?authSource=admin" \
mereith/van-blog:test-20230224-135110
