import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, User, ArrowRight } from 'lucide-react';
import { getAllPosts } from '../utils/blogUtils';

const BlogList = ({ onSelectPost, onBack }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const allPosts = await getAllPosts();
        setPosts(allPosts);
      } catch (err) {
        console.error('Failed to fetch posts:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mb-4"></div>
        <p className="text-gray-500">Loading blog posts...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
        <p className="text-red-500 font-bold mb-4">Error loading blog: {error}</p>
        <button onClick={onBack} className="text-indigo-600 font-semibold hover:underline">
          Back to Generator
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 py-8 md:px-8 max-w-5xl mx-auto w-full">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Palettable Blog</h1>
          <p className="text-gray-600">Insights, tips, and inspiration from the world of color.</p>
        </div>
        <button
          onClick={onBack}
          className="px-4 py-2 text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
        >
          Back to Generator
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {posts.map((post, index) => (
          <motion.div
            key={post.slug}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="group cursor-pointer bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100"
            onClick={() => onSelectPost(post.slug)}
          >
            <div className="p-6">
              <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                <span className="flex items-center gap-1">
                  <Calendar size={14} />
                  {post.date}
                </span>
                <span className="flex items-center gap-1">
                  <User size={14} />
                  {post.author}
                </span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-indigo-600 transition-colors">
                {post.title}
              </h2>
              <p className="text-gray-600 mb-6 line-clamp-3">
                {post.excerpt}
              </p>
              <div className="flex items-center text-indigo-600 font-semibold text-sm group-hover:translate-x-1 transition-transform">
                Read More <ArrowRight size={16} className="ml-1" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {posts.length === 0 && (
        <div className="text-center py-20">
          <p className="text-gray-500">No blog posts found yet. Check back soon!</p>
        </div>
      )}
    </div>
  );
};

export default BlogList;
