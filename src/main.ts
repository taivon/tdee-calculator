import './styles/base.css';
import './styles/layout.css';
import './styles/calculator.css';
import { calculateTdee, validateInput } from './calculator/engine';
import { renderAdvancedPanel, updateAdvancedPanel } from './ui/advanced-panel';
import { createDefaultInput, renderCalculatorForm } from './ui/calculator-form';
import { initFaqAccordion } from './ui/faq';
import { renderResults } from './ui/results-panel';

/** Shared calculator form state mutated by form and advanced panel. */
const input = createDefaultInput();

/** Recomputes results and refreshes all dependent UI. */
function recalculate(): void {
  const validated = validateInput(input);

  if (!validated.ok) {
    formControls.setFieldErrors(validated.fieldErrors);
    renderResults(resultsMount, null);
    updateAdvancedPanel(advancedMount, null, validated.fieldErrors);
    return;
  }

  formControls.setFieldErrors({});
  const result = calculateTdee(validated.value);
  renderResults(resultsMount, result);
  updateAdvancedPanel(advancedMount, result, {});
}

const app = document.getElementById('calculator-app')!;

app.innerHTML = `
  <div class="calculator-card">
    <div class="calculator-grid">
      <div id="form-column"></div>
      <div id="results-column" class="results-sticky"></div>
    </div>
    <div id="advanced-mount"></div>
  </div>
`;

const formColumn = app.querySelector<HTMLElement>('#form-column')!;
const resultsMount = app.querySelector<HTMLElement>('#results-column')!;
const advancedMount = app.querySelector<HTMLElement>('#advanced-mount')!;

const formControls = renderCalculatorForm(formColumn, input, (next) => {
  Object.assign(input, next);
  recalculate();
});

renderAdvancedPanel(advancedMount, input, (next) => {
  Object.assign(input, next);
  recalculate();
});

/** Mobile sticky bar showing TDEE when scrolled past results. */
const stickyBar = document.createElement('div');
stickyBar.id = 'mobile-sticky-bar';
stickyBar.className = 'mobile-sticky-bar';
stickyBar.hidden = true;
document.body.appendChild(stickyBar);

initFaqAccordion();
document.getElementById('year')!.textContent = String(new Date().getFullYear());

renderResults(resultsMount, null);
updateAdvancedPanel(advancedMount, null, {});
