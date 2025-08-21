import { useEffect, useState } from "react";
import axios from "axios";

function App() {
  const [soldiers, setSoldiers] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:5000/soldiers")
      .then(res => setSoldiers(res.data))
      .catch(err => console.log(err));
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold">Soldiers List</h1>
      <ul>
        {soldiers.map((s, i) => (
          <li key={i}>{s.name} - {s.rank} ({s.unit})</li>
        ))}
      </ul>
    </div>
  );
}

export default App;
