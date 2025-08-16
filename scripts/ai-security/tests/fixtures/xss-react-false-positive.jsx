
// SECURE: React automatic escaping (potential false positive)
function UserComment({ comment }) {
  return <div className="comment">{comment}</div>;
}

// SECURE: React with proper sanitization
import DOMPurify from 'dompurify';
function SafeHTML({ content }) {
  const sanitized = DOMPurify.sanitize(content);
  return <div dangerouslySetInnerHTML={{__html: sanitized}} />;
}