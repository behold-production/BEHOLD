import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, Copy, Check, MessageCircle, BookOpen } from 'lucide-react';
import ApiService from '../../shared/services/api';
import { DEFAULT_BLOGS_DATA } from './defaultBlogsData';

const BlogPostDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [relatedBlogs, setRelatedBlogs] = useState([]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const fetchPost = async () => {
      setLoading(true);
      try {
        const res = await ApiService.getBlogBySlug(slug);
        if (res?.data) {
          setPost(res.data);
          const allRes = await ApiService.getBlogs({ limit: 3 });
          if (allRes?.data && Array.isArray(allRes.data)) {
            setRelatedBlogs(allRes.data.filter(b => b.slug !== slug).slice(0, 3));
          }
        } else {
          const localMatch = DEFAULT_BLOGS_DATA.find(b => b.slug === slug);
          if (localMatch) {
            setPost(localMatch);
            setRelatedBlogs(DEFAULT_BLOGS_DATA.filter(b => b.slug !== slug).slice(0, 3));
          }
        }
      } catch (err) {
        console.warn('Using local fallback for blog detail:', err);
        const localMatch = DEFAULT_BLOGS_DATA.find(b => b.slug === slug);
        if (localMatch) {
          setPost(localMatch);
          setRelatedBlogs(DEFAULT_BLOGS_DATA.filter(b => b.slug !== slug).slice(0, 3));
        }
      } finally {
        setLoading(false);
      }
    };
    if (slug) fetchPost();
  }, [slug]);

  useEffect(() => {
    if (post) {
      document.title = `${post.title} | Behold Aspire`;
    } else {
      document.title = 'Behold Aspire | Student Career Guidance & Aptitude Testing';
    }
  }, [post]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(`Check out this insightful article on Behold Aspire: "${post?.title}"\n${window.location.href}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const handleBack = () => {
    navigate('/blog');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-[#f7f4ef] text-[#1c1514] pt-28 pb-16">
        <div className="w-10 h-10 border-3 border-[#2b211e] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center text-center px-4 bg-[#f7f4ef] text-[#1c1514] pt-28 pb-16">
        <BookOpen className="w-14 h-14 text-[#2b211e] mb-4 opacity-75" />
        <h1 className="text-2xl font-bold mb-2 uppercase tracking-wide">Article Not Found</h1>
        <p className="text-[#6e635e] mb-6 text-sm">The article you are looking for may have been moved or unpublished.</p>
        <button
          type="button"
          onClick={handleBack}
          className="px-7 py-3 rounded-full bg-[#2b211e] hover:bg-[#1c1514] text-[#f7f4ef] font-bold text-xs uppercase tracking-widest cursor-pointer border-none shadow-xs transition-all"
        >
          Back to All Articles
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#f7f4ef] text-[#1c1514] pt-28 pb-20 selection:bg-[#2b211e] selection:text-[#f7f4ef]">
      <main className="flex-1">
        <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back Button */}
          <button
            type="button"
            onClick={handleBack}
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#1c1514] hover:text-[#7c7069] mb-8 transition-colors cursor-pointer bg-transparent border-none p-0"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to All Articles</span>
          </button>

          {/* Category & Read Time */}
          <div className="flex flex-wrap items-center gap-3 mb-5">
            <span className="px-4 py-1.5 rounded-full bg-[#eae4dc] border border-[#d8d0c7] text-[#1c1514] text-[10px] font-bold tracking-widest uppercase shadow-2xs">
              {post.category || 'Career Guidance'}
            </span>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[#7c7069] uppercase tracking-wider">
              <Clock className="w-3.5 h-3.5 text-[#2b211e]" />
              <span>{post.readTime || '5 min read'}</span>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-sans tracking-tight text-[#1c1514] leading-tight mb-8">
            {post.title}
          </h1>

          {/* Author & Share Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-8 mb-10 border-b border-[#d6cecb]">
            <div className="flex items-center gap-4">
              {post.author?.avatar ? (
                <img
                  src={post.author.avatar}
                  alt={post.author?.name}
                  className="w-12 h-12 rounded-full object-cover border border-[#d6cecb] shrink-0"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-[#2b211e] text-[#f7f4ef] border border-[#d6cecb] flex items-center justify-center font-sans text-base font-black uppercase shrink-0 shadow-2xs">
                  {(post.author?.name || 'B').charAt(0)}
                </div>
              )}
              <div>
                <h3 className="text-sm font-bold text-[#1c1514]">
                  {post.author?.name || 'Behold Aspire Editorial Team'}
                </h3>
                <p className="text-xs text-[#6e635e] font-medium">
                  {post.author?.role || 'Senior Career Counsellor & Mentor'}
                </p>
              </div>
            </div>

            {/* Share Buttons */}
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={handleShareWhatsApp}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#2b211e] hover:bg-[#1c1514] text-[#f7f4ef] text-xs font-bold uppercase tracking-wider transition-all cursor-pointer border-none shadow-xs"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Share WhatsApp</span>
              </button>

              <button
                type="button"
                onClick={handleCopyLink}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#eae4dc] hover:bg-[#e2dad2] text-[#1c1514] text-xs font-bold uppercase tracking-wider transition-all cursor-pointer border border-[#d8d0c7]"
              >
                {copied ? <Check className="w-4 h-4 text-[#1c1514]" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Copied!' : 'Copy Link'}</span>
              </button>
            </div>
          </div>

          {/* Cover Image */}
          {post.coverImage && (
            <div className="mb-12 rounded-3xl overflow-hidden border border-[#d6cecb] shadow-sm bg-[#eae4dc]">
              <img
                src={post.coverImage}
                alt={post.title}
                className="w-full h-auto max-h-[480px] object-cover"
              />
            </div>
          )}

          {/* Article Excerpt Banner */}
          {post.excerpt && (
            <div className="p-6 sm:p-8 rounded-2xl bg-[#eae4dc] border-l-4 border-[#2b211e] border border-[#d8d0c7] mb-12 shadow-2xs">
              <p className="text-base sm:text-lg text-[#2b211e] font-medium leading-relaxed">
                {post.excerpt}
              </p>
            </div>
          )}

          {/* Rich Content Body */}
          <div
            className="prose max-w-none text-[#4a3f3a] text-base sm:text-lg leading-relaxed space-y-6 [&_h2]:text-2xl [&_h2]:sm:text-3xl [&_h2]:font-bold [&_h2]:uppercase [&_h2]:text-[#1c1514] [&_h2]:mt-12 [&_h2]:mb-4 [&_h2]:tracking-tight [&_h3]:text-xl [&_h3]:font-bold [&_h3]:uppercase [&_h3]:text-[#2b211e] [&_h3]:mt-8 [&_h3]:mb-3 [&_p]:leading-relaxed [&_ul]:list-disc [&_ul]:pl-6 [&_li]:mb-2"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="mt-12 pt-8 border-t border-[#d6cecb] flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-[#7c7069] uppercase tracking-wider mr-2">Topics:</span>
              {post.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="px-3.5 py-1 rounded-full bg-[#eae4dc] border border-[#d8d0c7] text-[10px] font-bold uppercase tracking-wider text-[#1c1514]"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </article>

        {/* Related Articles Section */}
        {relatedBlogs.length > 0 && (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-20 pt-16 border-t border-[#d6cecb]">
            <h2 className="text-2xl sm:text-3xl font-bold uppercase tracking-tight text-[#1c1514] mb-8">
              More Insights From BEHOLD.
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedBlogs.map((item) => (
                <div
                  key={item.slug}
                  onClick={() => navigate(`/blog/${item.slug}`)}
                  className="bg-white hover:bg-[#fcfbf9] border border-[#d6cecb] hover:border-[#1c1514] rounded-3xl p-6 cursor-pointer transition-all duration-300 space-y-3 shadow-2xs group"
                >
                  <span className="text-[10px] font-bold text-[#7c7069] uppercase tracking-widest block">
                    {item.category}
                  </span>
                  <h3 className="text-base font-bold text-[#1c1514] group-hover:text-[#2b211e] transition-colors line-clamp-2 leading-tight">
                    {item.title}
                  </h3>
                  <p className="text-xs text-[#6e635e] line-clamp-2 leading-relaxed">{item.excerpt}</p>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

export default BlogPostDetail;
