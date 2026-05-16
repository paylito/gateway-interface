import { BrowserRouter, Routes, Route } from 'react-router-dom';
import OrderPage from './pages/OrderPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/:id" element={<OrderPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
