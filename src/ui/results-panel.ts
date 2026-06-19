import type { CalculatorResult } from '../calculator/types';

/**
 * Formats a calorie value for display, or an em dash when unavailable.
 * @param value - Calorie count, or null when inputs are invalid.
 */
function formatCalories(value: number | null): string {
  return value === null ? '—' : value.toLocaleString();
}

/**
 * Renders TDEE results, goal cards, and macro breakdown.
 * @param mount - Container for the results column.
 * @param result - Computed calculator output, or null when inputs are invalid.
 */
export function renderResults(mount: HTMLElement, result: CalculatorResult | null): void {
  const tdee = result?.tdee ?? null;
  const protein = result?.proteinGrams ?? null;
  const fat = result?.fatGrams ?? null;
  const carbs = result?.carbGrams ?? null;
  const macroTotal = protein !== null && fat !== null && carbs !== null ? protein + fat + carbs : 0;

  const proteinPct = macroTotal ? Math.round((protein! / macroTotal) * 100) : 33;
  const fatPct = macroTotal ? Math.round((fat! / macroTotal) * 100) : 33;
  const carbPct = macroTotal ? 100 - proteinPct - fatPct : 34;

  mount.innerHTML = `
    <div class="results-panel ${result ? 'results-panel--active' : ''}">
      <p class="results-label">Daily Energy Expenditure</p>
      <p class="results-tdee">${formatCalories(tdee)} <span class="results-unit">${tdee !== null ? 'calories/day' : ''}</span></p>
      ${result ? `<p class="results-bmr">BMR: ${result.bmr.toLocaleString()} kcal</p>` : ''}

      <div class="goal-cards" role="group" aria-label="Calorie targets by goal">
        <div class="goal-card">
          <span class="goal-card__label">Weight loss</span>
          <span class="goal-card__value">${formatCalories(result?.cutCalories ?? null)}</span>
        </div>
        <div class="goal-card goal-card--primary">
          <span class="goal-card__label">Maintain</span>
          <span class="goal-card__value">${formatCalories(result?.maintainCalories ?? null)}</span>
        </div>
        <div class="goal-card">
          <span class="goal-card__label">Muscle gain</span>
          <span class="goal-card__value">${formatCalories(result?.bulkCalories ?? null)}</span>
        </div>
      </div>

      <div class="macro-section">
        <h3 class="macro-heading">Daily macros</h3>
        ${
          result
            ? `
          <div class="macro-bar" role="img" aria-label="Protein ${protein}g, Fat ${fat}g, Carbs ${carbs}g">
            <div class="macro-bar__segment macro-bar__segment--protein" style="width: ${proteinPct}%"></div>
            <div class="macro-bar__segment macro-bar__segment--fat" style="width: ${fatPct}%"></div>
            <div class="macro-bar__segment macro-bar__segment--carb" style="width: ${carbPct}%"></div>
          </div>
          <ul class="macro-legend">
            <li><span class="macro-dot macro-dot--protein"></span> Protein <strong>${protein}g</strong></li>
            <li><span class="macro-dot macro-dot--fat"></span> Fat <strong>${fat}g</strong></li>
            <li><span class="macro-dot macro-dot--carb"></span> Carbs <strong>${carbs}g</strong></li>
          </ul>
        `
            : '<p class="macro-empty">Enter your details to see macro targets.</p>'
        }
      </div>
    </div>
  `;

  const stickyBar = document.getElementById('mobile-sticky-bar');
  if (stickyBar) {
    stickyBar.textContent = tdee !== null ? `TDEE: ${tdee.toLocaleString()} kcal/day` : '';
    stickyBar.hidden = tdee === null;
  }
}

/**
 * Renders the formula comparison table inside the advanced panel.
 * @param mount - Table container element.
 * @param result - Latest calculator result, or null.
 */
export function renderFormulaTable(mount: HTMLElement, result: CalculatorResult | null): void {
  if (!result) {
    mount.innerHTML = '<p class="formula-empty">Enter valid stats to compare formulas.</p>';
    return;
  }

  mount.innerHTML = `
    <table class="formula-table">
      <thead>
        <tr>
          <th scope="col">Formula</th>
          <th scope="col">BMR (kcal)</th>
        </tr>
      </thead>
      <tbody>
        ${result.formulaResults
          .map(
            (row) => `
          <tr class="${row.available ? '' : 'formula-table__row--disabled'}">
            <td>${row.label}</td>
            <td>${row.available ? row.bmr.toLocaleString() : '—'}</td>
          </tr>
        `,
          )
          .join('')}
      </tbody>
    </table>
  `;
}
