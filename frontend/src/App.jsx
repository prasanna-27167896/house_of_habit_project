import { useState } from 'react';
import { BrowserRouter } from 'react-router-dom';
import Header from './components/layouts/Header/Header';
import Footer from './components/layouts/Footer/Footer';
import MobileNavBar from './components/layouts/MobileNavBar/MobileNavBar';
import AppRoutes from './routes/AppRoutes';

const App = () => {
  /* ── Shared panel state ── */
  const [openPanel, setOpenPanel] = useState(null);

  return (
    <BrowserRouter>
      <Header
        openPanel={openPanel}
        setOpenPanel={setOpenPanel}
      />
      <AppRoutes />
      <Footer />
      <MobileNavBar activePanel={openPanel} onAction={setOpenPanel} />
    </BrowserRouter>
  );
};

export default App;
