import HeroBanner from '../../components/home/HeroBanner/HeroBanner';
import BestSellers from '../../components/home/BestSellers/BestSellers';
import Categories from '../../components/home/Categories/Categories';

const Home = () => (
  <main>
    <div className='container'>
      <HeroBanner />
      <BestSellers />
      <Categories />
    </div>
  </main>
);

export default Home;
