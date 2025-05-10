import { useNavigate } from 'react-router-dom';

export default function Home( { socket } ) {
  const navigate = useNavigate();

  const handlePlay = () => {
    navigate('/lobby');
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '100px' }}>
      <h1>✏️ Welcome to Skribbl Clone</h1>
      <button onClick={handlePlay} style={{ padding: '10px 20px', fontSize: '18px' }}>
        ▶️ Play
      </button>
    </div>
  );
}
