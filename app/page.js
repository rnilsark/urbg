export default function Home() {
  // This page should never be seen as we're redirecting to the static HTML file
  return (
    <div>
      <h1>Redirecting to game...</h1>
      <script dangerouslySetInnerHTML={{ __html: `window.location.href = '/index.html';` }} />
    </div>
  );
} 