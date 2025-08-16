
// VULNERABLE: Direct HTML injection
function displayUserComment(comment) {
  document.getElementById('comments').innerHTML = comment;
}

// VULNERABLE: React dangerouslySetInnerHTML
function UserPost({ content }) {
  return <div dangerouslySetInnerHTML={{__html: content}} />;
}

// VULNERABLE: Template literal injection
function generateHTML(userInput) {
  return `<div class="user-content">${userInput}</div>`;
}