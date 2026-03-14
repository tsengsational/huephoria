import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { getPageBySlug } from '../utils/blogUtils';

const StaticPage = () => {
  const { pageId } = useParams();
  const navigate = useNavigate();
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPage = async () => {
      setLoading(true);
      const data = await getPageBySlug(pageId);
      setPage(data);
      setLoading(false);
    };
    fetchPage();
  }, [pageId]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!page) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center p-12">
        <h2 className="text-2xl font-bold text-gray-900">404 - Page Not Found</h2>
        <p className="text-gray-600">The page you are looking for does not exist.</p>
        <button onClick={() => navigate('/')} className="text-indigo-600 font-semibold hover:underline">
          Back to Home
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 py-8 md:px-8 max-w-4xl mx-auto w-full">
      <motion.button
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-500 hover:text-indigo-600 transition-colors mb-8 group"
      >
        <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
        Back
      </motion.button>

      <article className="prose lg:prose-xl max-w-none">
        <ReactMarkdown>{page.body}</ReactMarkdown>
      </article>

      <div className="mt-20 pt-10 border-t border-gray-100 italic text-sm text-gray-400">
        Last updated: {new Date().toLocaleDateString()}
      </div>
    </div>
  );
};

export default StaticPage;
