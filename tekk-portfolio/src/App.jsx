import Navbar   from './components/Navbar';
import Hero     from './components/Hero';
import About    from './components/About';
import Services from './components/Services';
import Projects from './components/Projects';
import Contact  from './components/Contact';

export default function App() {
  return (
    <div className="relative min-h-screen bg-bg-primary text-white overflow-x-hidden">
      <Navbar />
      <Hero />
      <About />
      <Services />
      <Projects />
      <Contact />
    </div>
  );
}
