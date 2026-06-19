import './styles/base.css';
import './styles/layout.css';
import { initFaqAccordion } from './ui/faq';

initFaqAccordion();
document.getElementById('year')!.textContent = String(new Date().getFullYear());
