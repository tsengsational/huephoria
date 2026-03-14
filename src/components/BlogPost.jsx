import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, User, ChevronLeft } from 'lucide-react';
import { getPostBySlug } from '../utils/blogUtils';

const BlogPost = ({ onBack }) => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      const data = await getPostBySlug(slug);
      setPost(data);
      setLoading(false);
    };
    fetchPost();
  }, [slug]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4">
        <p className="text-xl text-gray-600">Post not found.</p>
        <button onClick={onBack} className="text-indigo-600 font-semibold hover:underline">
          Back to Blog
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 py-8 md:px-8 max-w-4xl mx-auto w-full">
      <motion.button
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={onBack}
        className="flex items-center gap-2 text-gray-500 hover:text-indigo-600 transition-colors mb-8 group"
      >
        <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
        Back to Blog
      </motion.button>

      <article className="prose lg:prose-xl max-w-none">
        <header className="mb-10">
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-6 leading-tight">
            {post.title}
          </h1>
          <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <Calendar size={18} />
              {post.date}
            </div>
            <div className="flex items-center gap-2">
              <User size={18} />
              {post.author}
            </div>
          </div>
        </header>

        <div className="markdown-content">
          <ReactMarkdown>{post.body}</ReactMarkdown>
        </div>
      </article>

      <div className="mt-20 pt-10 border-t border-gray-100">
        <h3 className="text-xl font-bold mb-4 text-gray-900">Enjoying Palettable?</h3>
        <p className="text-gray-600 mb-6">
          Create your own stunning color palettes in seconds with our AI-powered generator.
        </p>
        <button
          onClick={() => window.location.reload()} // Quick hack to go back to home if needed, but App.jsx handles routing better
          className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all shadow-lg hover:shadow-indigo-500/30"
        >
          Go to Generator
        </button>
      </div>
    </div>
  );
};

export default BlogPost;
