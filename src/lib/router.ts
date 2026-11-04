import { useEffect, useState } from 'react';

function readPath(): string {
  return window.location.hash.replace(/^#/, '') || '/';
}

export function useRoute(): string {
  const [path, setPath] = useState(readPath);

  useEffect(() => {
    const onChange = () => {
      setPath(readPath());
      window.scrollTo({ top: 0 });
    };
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);

  return path;
}
